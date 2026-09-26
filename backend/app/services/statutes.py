from typing import Dict, Any, List
try:
    from google import genai
    HAS_NEW_GENAI = True
except ImportError:
    import google.generativeai as genai
    HAS_NEW_GENAI = False

from app.core.config import settings

STATUTORY_TOPICS = {
    "cheque_bounce": {
        "title": "Dishonour of Cheque (Section 138 NI Act)",
        "statute": "Negotiable Instruments Act, 1881",
        "key_points": [
            "Cheque must be presented within its validity period (typically 3 months).",
            "Statutory notice must be dispatched within 30 days of receiving the bank memo.",
            "Accused gets a mandatory 15-day grace period to make payment.",
            "If unpaid after 15 days, a criminal complaint under Sec 138/142 must be filed before the Magistrate within 30 days.",
            "Offence punishable with up to 2 years imprisonment, or fine up to twice the cheque amount, or both."
        ]
    },
    "consumer_rights": {
        "title": "Consumer Redressal & E-Commerce Grievances",
        "statute": "Consumer Protection Act, 2019",
        "key_points": [
            "Pecuniary Jurisdiction: District Commission (DCDRC) up to ₹50 Lakhs; State Commission up to ₹2 Crores; National Commission (NCDRC) above ₹2 Crores.",
            "Filing can be done online through the e-Daakhil portal (edaakhil.nic.in).",
            "Covers misleading advertisements, unfair contracts, deficiency in service, and product liability against e-commerce platforms.",
            "No mandatory advocate representation needed; consumer can appear in person."
        ]
    },
    "unpaid_salary": {
        "title": "Recovery of Unpaid Salary & Wages",
        "statute": "Payment of Wages Act 1936 & Indian Contract Act 1872",
        "key_points": [
            "Employer cannot withhold wages arbitrarily upon resignation or serving notice period.",
            "First step: Issue a formal Legal Notice demanding dues with 15-day timeline and 18% p.a. interest.",
            "Remedies: File a claim before the Labor Commissioner / Labor Court under Section 33C(2) of Industrial Disputes Act, or a Summary Suit under Order 37 CPC."
        ]
    },
    "rti_rights": {
        "title": "Right to Information (RTI)",
        "statute": "Right to Information Act, 2005",
        "key_points": [
            "Any citizen can seek information from any Public Authority under Section 6(1).",
            "Application fee is ₹10 (waived for BPL card holders).",
            "Information must be provided within 30 days (or within 48 hours if it concerns life or liberty under Section 7(1) proviso).",
            "If denied or delayed, First Appeal must be filed within 30 days under Section 19(1)."
        ]
    },
    "free_legal_aid": {
        "title": "Free Legal Aid & Representation",
        "statute": "Section 12, Legal Services Authorities Act, 1987",
        "key_points": [
            "Eligible categories entitled to 100% free legal aid through NALSA / SLSA / DLSA:",
            "1. Women and Children (regardless of income).",
            "2. Members of Scheduled Castes (SC) or Scheduled Tribes (ST).",
            "3. Industrial workmen / laborers.",
            "4. Victims of human trafficking, mass disaster, ethnic violence, or flood.",
            "5. Persons with disabilities or mental illness.",
            "6. Persons in custody / undertrials.",
            "7. Citizens whose annual income is less than ₹3,00,000 (varies by state between ₹1 Lakh to ₹3 Lakhs)."
        ]
    }
}


def answer_legal_query(question: str) -> Dict[str, Any]:
    """Provide grounded Indian legal guidance using Gemini or knowledge base."""
    is_gemini_active = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))

    if is_gemini_active:
        prompt = f"""You are 'NyayaSahayak', an AI Legal Advisor specializing in Indian Law.
Your goal is to provide citizens with accurate, empathetic, plain-language legal guidance grounded in Indian statutes.

Relevant Legal Codes:
- Bharatiya Nyaya Sanhita 2023 (BNS) & IPC
- Bharatiya Nagarik Suraksha Sanhita 2023 (BNSS) & CrPC
- Consumer Protection Act 2019
- Negotiable Instruments Act 1881
- Right to Information Act 2005
- Legal Services Authorities Act 1987 (Free Legal Aid)

User Query: "{question}"

Instructions:
1. Explain the citizen's legal rights in simple, clear language.
2. Cite the exact Indian statutory sections (e.g. BNS/BNSS, Section 138 NI Act, Section 35 CPA 2019).
3. Outline a numbered step-by-step action plan (e.g., Step 1: Legal Notice, Step 2: Formal Complaint/FIR, Step 3: Legal Aid).
4. Include whether they are eligible for Free Legal Aid under NALSA Section 12.
5. Add a standard legal disclaimer at the end."""
        try:
            if HAS_NEW_GENAI:
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt
                )
                answer_content = response.text.strip()
            else:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel(settings.GEMINI_MODEL)
                response = model.generate_content(prompt)
                answer_content = response.text.strip()

            return {
                "question": question,
                "answer": answer_content,
                "engine": f"Google Gemini ({settings.GEMINI_MODEL})",
                "jurisdiction": "India"
            }
        except Exception as e:
            print(f"Gemini Q&A error: {e}. Reverting to statutory database.")

    # Fallback to statutory topics
    matched_key = "cheque_bounce"
    lower_q = question.lower()
    if "salary" in lower_q or "wage" in lower_q or "employer" in lower_q:
        matched_key = "unpaid_salary"
    elif "consumer" in lower_q or "refund" in lower_q or "product" in lower_q or "defect" in lower_q:
        matched_key = "consumer_rights"
    elif "rti" in lower_q or "information" in lower_q or "officer" in lower_q:
        matched_key = "rti_rights"
    elif "aid" in lower_q or "free lawyer" in lower_q or "nalsa" in lower_q or "poor" in lower_q:
        matched_key = "free_legal_aid"

    topic = STATUTORY_TOPICS[matched_key]
    answer_text = f"""### {topic['title']}
**Governing Statute:** {topic['statute']}

**Key Legal Principles & Rights:**
""" + "\n".join([f"- {pt}" for pt in topic["key_points"]]) + """

**Recommended Immediate Next Steps:**
1. Collect and preserve all documentary proof (invoices, WhatsApp/email communications, bank statements, transaction receipts).
2. Issue a formal Advocate Legal Demand Notice granting a 15-day statutory window to remedy the default.
3. If unaddressed, escalate to the appropriate judicial or regulatory forum (District Consumer Commission, Magistrate Court, or Labor Commissioner).
4. If you require free legal representation, contact your District Legal Services Authority (DLSA) under Section 12 of the Legal Services Authorities Act.

*Disclaimer: This information is for educational legal literacy under Indian law and does not constitute formal attorney counsel.*
"""
    return {
        "question": question,
        "answer": answer_text,
        "engine": "Indian Statutory Knowledge Base (Add GEMINI_API_KEY for dynamic AI guidance)",
        "jurisdiction": "India"
    }
