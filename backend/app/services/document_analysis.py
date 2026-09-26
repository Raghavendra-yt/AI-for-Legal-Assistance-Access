"""
Document and Image Analysis Service - NyayaSahayak
Provides AI-powered analysis of uploaded images, PDFs, and documents using Gemini.
"""

import base64
import logging
from typing import Optional
try:
    from google import genai
    from google.genai import types as genai_types
    HAS_NEW_GENAI = True
except ImportError:
    import google.generativeai as genai
    HAS_NEW_GENAI = False

from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf",
}

MAX_FILE_SIZE_MB = 20


def _build_analysis_prompt(file_type: str, user_query: str) -> str:
    file_context = (
        "image (such as a photograph of a legal document, cheque, notice, invoice, or screenshot)"
        if file_type.startswith("image/")
        else "document (legal PDF, notice, contract, or text file)"
    )
    return f'''You are 'NyayaSahayak', an AI Legal Advisor specializing in Indian Law.

The user has uploaded a {file_context} and asks: "{user_query or 'Please analyze this document for any legal issues, rights, or actions I should take.'}"

Perform the following:
1. **Content Summary**: Describe what the document contains (parties, dates, amounts, key clauses).
2. **Legal Issues Identified**: Identify any legal rights violations, fraudulent elements, or actionable matters under Indian law.
3. **Applicable Indian Statutes**: Cite relevant sections (BNS, BNSS, NI Act, CPA 2019, RTI Act, IPC/CrPC equivalents, Contract Act).
4. **Recommended Action Plan**: Step-by-step numbered actions the citizen should take.
5. **Free Legal Aid Eligibility**: State if the matter qualifies for NALSA free legal aid under Section 12.
6. **Risk Level**: Rate as Low / Medium / High with a brief reason.

Use plain, empathetic language suitable for a layperson. Add a standard disclaimer at the end.'''


def analyze_document(
    file_bytes: bytes,
    file_name: str,
    mime_type: str,
    user_query: str = "",
) -> dict:
    if mime_type not in ALLOWED_MIME_TYPES:
        return {"success": False, "error": f"Unsupported file type '{mime_type}'. Allowed: images, PDFs, and Word documents."}

    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        return {"success": False, "error": f"File is too large ({size_mb:.1f} MB). Maximum allowed is {MAX_FILE_SIZE_MB} MB."}

    is_gemini_active = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))
    if not is_gemini_active:
        return {"success": False, "error": "Gemini API key not configured. Document analysis requires an active Gemini API key."}

    prompt = _build_analysis_prompt(mime_type, user_query)

    try:
        if HAS_NEW_GENAI:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            model = "gemini-2.5-flash-lite"
            contents = [genai_types.Part.from_bytes(data=file_bytes, mime_type=mime_type), prompt]
            response = client.models.generate_content(model=model, contents=contents)
            analysis_text = response.text.strip()
        else:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model_obj = genai.GenerativeModel("gemini-pro-vision")
            encoded = base64.b64encode(file_bytes).decode("utf-8")
            image_part = {"mime_type": mime_type, "data": encoded}
            response = model_obj.generate_content([prompt, image_part])
            analysis_text = response.text.strip()

        return {
            "success": True,
            "file_name": file_name,
            "file_type": mime_type,
            "file_size_kb": round(len(file_bytes) / 1024, 1),
            "analysis": analysis_text,
            "engine": "Google Gemini (gemini-2.5-flash-lite) - Multimodal Vision",
            "jurisdiction": "India",
        }
    except Exception as exc:
        logger.error("Document analysis error for '%s': %s", file_name, exc, exc_info=True)
        return {"success": False, "error": f"Analysis failed: {str(exc)}"}
