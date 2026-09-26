from fastapi import FastAPI, HTTPException, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, field_validator
from typing import Dict, Any, Optional
from pathlib import Path
import logging

try:
    # When run as "backend.app.main" (Vercel / installed package)
    from backend.app.core.config import settings
    from backend.app.services.drafter import DRAFT_TEMPLATES, generate_legal_draft, export_draft_to_pdf
    from backend.app.services.statutes import answer_legal_query, STATUTORY_TOPICS
    from backend.app.services.voice_nlp import process_voice_nlp
    from backend.app.services.translator import translate_legal_text
    from backend.app.services.document_analysis import analyze_document
except ImportError:
    # When run locally as "app.main" (uvicorn app.main:app)
    from app.core.config import settings  # type: ignore
    from app.services.drafter import DRAFT_TEMPLATES, generate_legal_draft, export_draft_to_pdf  # type: ignore
    from app.services.statutes import answer_legal_query, STATUTORY_TOPICS  # type: ignore
    from app.services.voice_nlp import process_voice_nlp  # type: ignore
    from app.services.translator import translate_legal_text  # type: ignore
    from app.services.document_analysis import analyze_document  # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AI Legal Assistance, Statutory Drafting, and Rights Navigation in India."
)

# CORS setup — restrict to known origins in production
allowed_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Security response headers middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)


class DraftRequest(BaseModel):
    template_id: str
    fields: Dict[str, Any]

    @field_validator("template_id")
    @classmethod
    def template_id_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("template_id must not be empty")
        return v


class LegalQARequest(BaseModel):
    query: str

    @field_validator("query")
    @classmethod
    def query_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("query must not be empty")
        if len(v) > 5000:
            raise ValueError("query must be 5000 characters or fewer")
        return v


class PDFExportRequest(BaseModel):
    title: str
    draft_text: str


class VoiceRequest(BaseModel):
    transcript: str

    @field_validator("transcript")
    @classmethod
    def transcript_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("transcript must not be empty")
        return v


class TranslateRequest(BaseModel):
    text: str
    target_language: str

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be empty")
        return v

    @field_validator("target_language")
    @classmethod
    def lang_must_be_valid(cls, v: str) -> str:
        allowed = {"en", "hi", "te", "ta", "ml", "kn", "bn", "mr", "gu", "pa"}
        if v not in allowed:
            raise ValueError(f"target_language must be one of: {', '.join(sorted(allowed))}")
        return v



@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "jurisdiction": "India (BNS, BNSS, CPA 2019, NI Act, RTI 2005)",
        "gemini_configured": bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))
    }


@app.get("/api/draft/templates")
def get_templates():
    """List all available Indian legal draft templates."""
    return {"templates": list(DRAFT_TEMPLATES.values())}


@app.post("/api/draft/generate")
def create_draft(req: DraftRequest):
    """Generate a court-ready Indian legal draft using Gemini or statutory engine."""
    try:
        result = generate_legal_draft(req.template_id, req.fields)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/draft/export-pdf")
def download_pdf(req: PDFExportRequest):
    """Generate and return a court-formatted legal PDF."""
    try:
        pdf_bytes = export_draft_to_pdf(req.title, req.draft_text)
        safe_filename = req.title.replace(" ", "_").replace("/", "_")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{safe_filename}.pdf"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")


@app.post("/api/legal-qa")
def legal_qa(req: LegalQARequest):
    """Citizen legal rights and statutory assistance under Indian Law."""
    try:
        return answer_legal_query(req.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/process")
def voice_process(req: VoiceRequest):
    """Process natural spoken citizen legal query through NLP."""
    try:
        return process_voice_nlp(req.transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice NLP processing error: {str(e)}")


@app.get("/api/statutes/topics")
def get_statutory_topics():
    """Get common Indian citizen legal topics and procedural checklists."""
    return {"topics": STATUTORY_TOPICS}


@app.post("/api/translate")
def translate_content(req: TranslateRequest):
    """Translate legal drafts, citizen queries, or guidance into Indian languages."""
    try:
        return translate_legal_text(req.text, req.target_language)
    except Exception as e:
        logger.error("Translation error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")


@app.post("/api/analyze-document")
async def analyze_document_endpoint(
    file: UploadFile = File(..., description="Image, PDF, or Word document to analyze"),
    query: str = Form(default="", description="Optional user question about the document"),
):
    """
    Analyze an uploaded image or document (PDF, Word, plain text) using Gemini AI.
    Returns a structured Indian legal analysis with applicable statutes and action plan.
    """
    ALLOWED_TYPES = {
        "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/rtf",
    }
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{content_type}'. Please upload an image, PDF, or Word document."
        )

    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum allowed size is 20 MB.")

    result = analyze_document(
        file_bytes=file_bytes,
        file_name=file.filename or "upload",
        mime_type=content_type,
        user_query=query.strip(),
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Document analysis failed."))

    return result



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
