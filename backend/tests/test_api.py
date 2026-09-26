"""
Comprehensive backend tests for NyayaSahayak API.
Covers: health, templates, drafting, legal-qa, voice, statutes, translate, document analysis.
Run with: pytest tests/ -v
"""
import sys
import os
import pytest

# Ensure the repo root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ─── Health ───────────────────────────────────────────────────────────────────

class TestHealth:
    def test_health_returns_200(self):
        resp = client.get("/api/health")
        assert resp.status_code == 200

    def test_health_payload_shape(self):
        data = client.get("/api/health").json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "app" in data
        assert "jurisdiction" in data
        assert "gemini_configured" in data

    def test_health_jurisdiction_india(self):
        data = client.get("/api/health").json()
        assert "India" in data["jurisdiction"]


# ─── Templates ────────────────────────────────────────────────────────────────

class TestTemplates:
    def test_get_templates_200(self):
        resp = client.get("/api/draft/templates")
        assert resp.status_code == 200

    def test_templates_returns_list(self):
        data = client.get("/api/draft/templates").json()
        assert "templates" in data
        assert isinstance(data["templates"], list)

    def test_templates_not_empty(self):
        data = client.get("/api/draft/templates").json()
        assert len(data["templates"]) >= 1

    def test_each_template_has_required_fields(self):
        templates = client.get("/api/draft/templates").json()["templates"]
        for tmpl in templates:
            assert "id" in tmpl
            assert "title" in tmpl or "name" in tmpl  # API returns 'title'

    def test_legal_notice_template_exists(self):
        templates = client.get("/api/draft/templates").json()["templates"]
        ids = [t["id"] for t in templates]
        assert "legal_notice_money" in ids


# ─── Draft Generation ─────────────────────────────────────────────────────────

class TestDraftGeneration:
    VALID_PAYLOAD = {
        "template_id": "legal_notice_money",
        "fields": {
            "claimant_name": "Rajesh Kumar",
            "claimant_address": "123 MG Road, Bengaluru",
            "respondent_name": "ABC Pvt Ltd",
            "respondent_address": "456 Brigade Road, Bengaluru",
            "amount_due": "50000",
            "due_date": "01-01-2025",
            "notice_date": "15-09-2025",
            "factual_timeline": "Respondent failed to pay salary for 3 months.",
        },
    }

    def test_draft_generation_200(self):
        resp = client.post("/api/draft/generate", json=self.VALID_PAYLOAD)
        assert resp.status_code == 200

    def test_draft_has_text(self):
        data = client.post("/api/draft/generate", json=self.VALID_PAYLOAD).json()
        assert "draft_text" in data
        assert len(data["draft_text"]) > 50

    def test_draft_has_title(self):
        data = client.post("/api/draft/generate", json=self.VALID_PAYLOAD).json()
        assert "title" in data

    def test_empty_template_id_rejected(self):
        payload = {**self.VALID_PAYLOAD, "template_id": "   "}
        resp = client.post("/api/draft/generate", json=payload)
        assert resp.status_code == 422

    def test_missing_template_id_rejected(self):
        resp = client.post("/api/draft/generate", json={"fields": {}})
        assert resp.status_code == 422

    def test_cheque_bounce_template(self):
        payload = {
            "template_id": "cheque_bounce",
            "fields": {
                "drawer_name": "Suresh Patel",
                "drawer_address": "Delhi",
                "payee_name": "Priya Sharma",
                "cheque_number": "123456",
                "cheque_amount": "25000",
                "bank_name": "SBI",
                "dishonour_date": "10-09-2025",
                "notice_date": "20-09-2025",
            },
        }
        resp = client.post("/api/draft/generate", json=payload)
        assert resp.status_code == 200

    def test_consumer_complaint_template(self):
        payload = {
            "template_id": "consumer_complaint",
            "fields": {
                "complainant_name": "Anita Singh",
                "complainant_address": "Pune",
                "opposite_party": "XYZ Electronics",
                "complaint_date": "25-09-2025",
                "product_service": "Laptop",
                "defect_description": "Screen stopped working after 2 weeks",
                "relief_sought": "Full refund of Rs 60,000",
            },
        }
        resp = client.post("/api/draft/generate", json=payload)
        assert resp.status_code == 200

    def test_rti_template(self):
        payload = {
            "template_id": "rti_application",
            "fields": {
                "applicant_name": "Mohan Das",
                "applicant_address": "Chennai",
                "public_authority": "Municipal Corporation",
                "information_sought": "Status of road construction tender No. 45/2024",
                "application_date": "26-09-2025",
            },
        }
        resp = client.post("/api/draft/generate", json=payload)
        assert resp.status_code == 200


# ─── Legal Q&A ────────────────────────────────────────────────────────────────

class TestLegalQA:
    def test_qa_valid_query(self):
        resp = client.post("/api/legal-qa", json={"query": "My employer has not paid my salary for 3 months. What can I do?"})
        assert resp.status_code == 200

    def test_qa_response_has_answer(self):
        data = client.post("/api/legal-qa", json={"query": "cheque bounced, what are my rights?"}).json()
        assert "answer" in data
        assert len(data["answer"]) > 20

    def test_qa_response_has_question(self):
        query = "RTI application denied"
        data = client.post("/api/legal-qa", json={"query": query}).json()
        assert "question" in data

    def test_qa_empty_query_rejected(self):
        resp = client.post("/api/legal-qa", json={"query": "  "})
        assert resp.status_code == 422

    def test_qa_too_long_query_rejected(self):
        resp = client.post("/api/legal-qa", json={"query": "x" * 5001})
        assert resp.status_code == 422

    def test_qa_consumer_topic(self):
        data = client.post("/api/legal-qa", json={"query": "I received a defective product from an online store. How to file consumer complaint?"}).json()
        assert "answer" in data

    def test_qa_missing_query_rejected(self):
        resp = client.post("/api/legal-qa", json={})
        assert resp.status_code == 422

    def test_qa_hindi_query_handled(self):
        resp = client.post("/api/legal-qa", json={"query": "mera vetan nahin mila. kya karna chahiye?"})
        assert resp.status_code == 200


# ─── Voice NLP ────────────────────────────────────────────────────────────────

class TestVoiceNLP:
    def test_voice_process_valid(self):
        resp = client.post("/api/voice/process", json={"transcript": "My employer Acme Corp owes me 50000 rupees since January 2025."})
        assert resp.status_code == 200

    def test_voice_response_is_dict(self):
        data = client.post("/api/voice/process", json={"transcript": "Cheque of 25000 rupees bounced from Suresh Mehta."}).json()
        assert isinstance(data, dict)

    def test_voice_empty_transcript_rejected(self):
        resp = client.post("/api/voice/process", json={"transcript": ""})
        assert resp.status_code == 422

    def test_voice_whitespace_transcript_rejected(self):
        resp = client.post("/api/voice/process", json={"transcript": "   "})
        assert resp.status_code == 422

    def test_voice_consumer_complaint(self):
        resp = client.post("/api/voice/process", json={"transcript": "I bought a washing machine from Samsung but it broke within a week. I want a refund of 35000 rupees."})
        assert resp.status_code == 200


# ─── Statutes ─────────────────────────────────────────────────────────────────

class TestStatutes:
    def test_topics_returns_200(self):
        resp = client.get("/api/statutes/topics")
        assert resp.status_code == 200

    def test_topics_has_dict(self):
        data = client.get("/api/statutes/topics").json()
        assert "topics" in data
        assert isinstance(data["topics"], dict)

    def test_cheque_bounce_topic_present(self):
        data = client.get("/api/statutes/topics").json()
        assert "cheque_bounce" in data["topics"]

    def test_free_legal_aid_topic_present(self):
        data = client.get("/api/statutes/topics").json()
        assert "free_legal_aid" in data["topics"]

    def test_consumer_rights_topic_present(self):
        data = client.get("/api/statutes/topics").json()
        assert "consumer_rights" in data["topics"]

    def test_each_topic_has_key_points(self):
        topics = client.get("/api/statutes/topics").json()["topics"]
        for key, topic in topics.items():
            assert "key_points" in topic, f"Topic {key} missing key_points"
            assert len(topic["key_points"]) > 0


# ─── Translation ──────────────────────────────────────────────────────────────

class TestTranslation:
    def test_valid_translate_hindi(self):
        resp = client.post("/api/translate", json={"text": "Your legal rights are protected.", "target_language": "hi"})
        assert resp.status_code == 200

    def test_invalid_language_rejected(self):
        resp = client.post("/api/translate", json={"text": "Hello", "target_language": "xx"})
        assert resp.status_code == 422

    def test_empty_text_rejected(self):
        resp = client.post("/api/translate", json={"text": "  ", "target_language": "hi"})
        assert resp.status_code == 422

    def test_all_valid_language_codes_accepted(self):
        valid_langs = ["en", "hi", "te", "ta", "ml", "kn", "bn", "mr", "gu", "pa"]
        for lang in valid_langs:
            resp = client.post("/api/translate", json={"text": "Test legal text.", "target_language": lang})
            assert resp.status_code == 200, f"Language code '{lang}' should be accepted"


# ─── Document Analysis ────────────────────────────────────────────────────────

class TestDocumentAnalysis:
    def test_unsupported_file_type_rejected(self):
        resp = client.post(
            "/api/analyze-document",
            files={"file": ("malware.exe", b"fake exe content", "application/octet-stream")},
            data={"query": ""},
        )
        assert resp.status_code == 422

    def test_oversized_file_rejected(self):
        huge_content = b"x" * (21 * 1024 * 1024)  # 21 MB
        resp = client.post(
            "/api/analyze-document",
            files={"file": ("big.txt", huge_content, "text/plain")},
            data={"query": ""},
        )
        assert resp.status_code == 413

    def test_text_file_format_accepted(self):
        content = b"This is a legal contract for sale of property."
        resp = client.post(
            "/api/analyze-document",
            files={"file": ("contract.txt", content, "text/plain")},
            data={"query": "What are the key clauses?"},
        )
        # 200 with Gemini key, 500 without — but not 422/413
        assert resp.status_code in (200, 500)

    def test_missing_file_rejected(self):
        resp = client.post("/api/analyze-document", data={"query": "test"})
        assert resp.status_code == 422


# ─── PDF Export ───────────────────────────────────────────────────────────────

class TestPDFExport:
    def test_pdf_export_returns_pdf_content_type(self):
        resp = client.post(
            "/api/draft/export-pdf",
            json={"title": "Test Legal Notice", "draft_text": "To Whomsoever It May Concern,\n\nThis is a test legal notice."},
        )
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"

    def test_pdf_export_has_content_disposition(self):
        resp = client.post(
            "/api/draft/export-pdf",
            json={"title": "My Notice", "draft_text": "Draft content here."},
        )
        assert "content-disposition" in resp.headers
        assert "attachment" in resp.headers["content-disposition"]

    def test_pdf_export_non_empty(self):
        resp = client.post(
            "/api/draft/export-pdf",
            json={"title": "Test", "draft_text": "Some content."},
        )
        assert len(resp.content) > 100


# ─── Security Headers ─────────────────────────────────────────────────────────

class TestSecurityHeaders:
    def test_x_content_type_options_present(self):
        resp = client.get("/api/health")
        assert resp.headers.get("x-content-type-options") == "nosniff"

    def test_x_frame_options_present(self):
        resp = client.get("/api/health")
        assert resp.headers.get("x-frame-options") == "DENY"

    def test_referrer_policy_present(self):
        resp = client.get("/api/health")
        assert "referrer-policy" in resp.headers

    def test_content_security_policy_present(self):
        resp = client.get("/api/health")
        assert "content-security-policy" in resp.headers
        assert "default-src 'self'" in resp.headers["content-security-policy"]

    def test_strict_transport_security_present(self):
        resp = client.get("/api/health")
        assert "strict-transport-security" in resp.headers

    def test_x_xss_protection_present(self):
        resp = client.get("/api/health")
        assert resp.headers.get("x-xss-protection") == "1; mode=block"

    def test_permissions_policy_present(self):
        resp = client.get("/api/health")
        assert "permissions-policy" in resp.headers

    def test_rate_limit_headers_on_api_call(self):
        resp = client.get("/api/draft/templates")
        assert resp.status_code == 200
        assert "x-ratelimit-limit" in resp.headers
        assert "x-ratelimit-remaining" in resp.headers

    def test_qa_caching_behavior(self):
        query = "What happens if a cheque bounces in India?"
        resp1 = client.post("/api/legal-qa", json={"query": query})
        assert resp1.status_code == 200
        resp2 = client.post("/api/legal-qa", json={"query": query})
        assert resp2.status_code == 200
        assert resp2.json().get("cached") is True

    def test_translation_caching_behavior(self):
        text = "This legal notice is served under Section 138."
        resp1 = client.post("/api/translate", json={"text": text, "target_language": "hi"})
        assert resp1.status_code == 200
        resp2 = client.post("/api/translate", json={"text": text, "target_language": "hi"})
        assert resp2.status_code == 200
        assert resp2.json().get("cached") is True


# ─── Input Validation Edge Cases ─────────────────────────────────────────────

class TestInputValidationEdgeCases:
    def test_sql_injection_in_query_handled_cleanly(self):
        payload = {"query": "'; DROP TABLE users; --"}
        resp = client.post("/api/legal-qa", json=payload)
        assert resp.status_code in (200, 422)

    def test_xss_payload_in_transcript(self):
        payload = {"transcript": "<script>alert('xss')</script> My employer owes me money."}
        resp = client.post("/api/voice/process", json=payload)
        assert resp.status_code in (200, 422)

    def test_unicode_hindi_query_accepted(self):
        payload = {"query": "mere niyokta ne vetan nahin diya. mujhe kya karna chahiye?"}
        resp = client.post("/api/legal-qa", json=payload)
        assert resp.status_code == 200

    def test_special_characters_in_draft_fields(self):
        payload = {
            "template_id": "legal_notice_money",
            "fields": {
                "claimant_name": "O'Brien & Associates",
                "amount_due": "Rs 1,00,000",
            },
        }
        resp = client.post("/api/draft/generate", json=payload)
        assert resp.status_code == 200

    def test_repeated_requests_stable(self):
        for _ in range(5):
            resp = client.get("/api/health")
            assert resp.status_code == 200
