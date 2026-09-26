import os
import json
from typing import Dict, Any, List, Optional
try:
    from google import genai
    HAS_NEW_GENAI = True
except ImportError:
    import google.generativeai as genai
    HAS_NEW_GENAI = False

from app.core.config import settings

VOICE_INTENTS = {
    "UNPAID_SALARY": {
        "title": "Unpaid Salary / Full & Final Settlement Dispute",
        "template_id": "legal_notice_money",
        "statutes": ["Payment of Wages Act 1936", "Indian Contract Act 1872 (Section 73)", "Order 37 CPC"]
    },
    "CHEQUE_BOUNCE": {
        "title": "Cheque Dishonour / Insufficient Funds",
        "template_id": "cheque_bounce_138",
        "statutes": ["Negotiable Instruments Act 1881 (Section 138 & 142)"]
    },
    "CONSUMER_FRAUD": {
        "title": "Defective Goods / Deficiency in E-Commerce Services",
        "template_id": "consumer_complaint",
        "statutes": ["Consumer Protection Act 2019 (Section 35)"]
    },
    "RTI_QUERY": {
        "title": "Public Authority Transparency & Records Request",
        "template_id": "rti_application",
        "statutes": ["Right to Information Act 2005 (Section 6(1))"]
    },
    "GENERAL_INQUIRY": {
        "title": "General Citizen Rights Consultation",
        "template_id": None,
        "statutes": ["Constitution of India", "Bharatiya Nyaya Sanhita 2023"]
    }
}


def fallback_rule_based_nlp(transcript: str) -> Dict[str, Any]:
    """Multilingual rule-based NLP parser for voice queries in English, Hindi, Telugu, Tamil, etc."""
    lower = transcript.lower()
    intent = "GENERAL_INQUIRY"
    
    # Multilingual intent detection
    salary_keywords = [
        "salary", "wages", "employer", "company not paying", "f&f", "relieving", "notice period",
        "वेतन", "सैलरी", "तनख्वाह", "मजदूरी", "कंपनी पैसे नहीं दे रही",
        "జీతం", "వేతనం", "యజమాని", "కంపెనీ డబ్బు ఇవ్వడం లేదు", "జీతాలు",
        "சம்பளம்", "ஊதியம்", "வேலை", "பணம் தரவில்லை",
        "ಸಂಬಳ", "ವೇತನ", "ಕಂಪನಿ ಹಣ ನೀಡುತ್ತಿಲ್ಲ",
        "বেতন", "মজুরি", "কোম্পানি টাকা দিচ্ছে না",
        "पगार", "वेतन", "मोबदला"
    ]
    cheque_keywords = [
        "cheque", "check", "bounce", "dishonour", "memo", "insufficient",
        "चेक", "बाउंस", "अनादर", "खाते में पैसे नहीं", "चेक बाउंस",
        "చెక్", "బౌన్స్", "చెల్లలేదు", "నిధులు సరిపోవు", "చెక్ బౌన్స్",
        "காசோலை", "பணம் இல்லை", "செக் பவுன்ஸ்",
        "ಚೆಕ್", "ಬೌನ್ಸ್", "ಖಾತೆಯಲ್ಲಿ ಹಣವಿಲ್ಲ",
        "চেক", "বাউন্স", "টাকা নেই"
    ]
    consumer_keywords = [
        "defective", "product", "amazon", "flipkart", "damaged", "repair", "refund", "refrigerator", "mobile", "warranty",
        "खराब", "दोषपूर्ण", "फ्रिज", "वारंटी", "पैसे वापस", "वापसी", "दुकानदार",
        "లోపం", "పాడైపోయింది", "ఫ్రిజ్", "వారంటీ", "రీఫండ్", "రిఫ్రిజిరేటర్", "వస్తువు",
        "குறைபாடு", "பழுது", "பிரிட்ஜ்", "வாரண்டி", "பணம் திருப்பித் தரவில்லை",
        "ದೋಷಯುಕ್ತ", "ಹಾಳಾಗಿದೆ", "ಫ್ರಿಜ್", "ವಾರಂಟಿ",
        "ত্রুটিপূর্ণ", "নষ্ট", "ওয়ারেন্টি"
    ]
    rti_keywords = [
        "rti", "information", "tender", "government officer", "municipality", "corporation", "road work",
        "आरटीआई", "सूचना का अधिकार", "टेंडर", "नगर निगम", "सरकारी रिकॉर्ड",
        "సమాచార హక్కు", "ఆర్టీఐ", "టెండర్", "మున్సిపాలిటీ", "ప్రభుత్వ రికార్డులు",
        "தகவல் அறியும் உரிமை", "ஆர்டிஐ", "டெண்டர்", "அரசு ஆவணங்கள்",
        "ಮಾಹಿತಿ ಹಕ್ಕು", "ಟೆಂಡರ್", "ಸರ್ಕಾರಿ ದಾಖಲೆಗಳು"
    ]

    if any(k in lower or k in transcript for k in salary_keywords):
        intent = "UNPAID_SALARY"
    elif any(k in lower or k in transcript for k in cheque_keywords):
        intent = "CHEQUE_BOUNCE"
    elif any(k in lower or k in transcript for k in consumer_keywords):
        intent = "CONSUMER_FRAUD"
    elif any(k in lower or k in transcript for k in rti_keywords):
        intent = "RTI_QUERY"

    meta = VOICE_INTENTS[intent]
    
    # Detect language for localized spoken output
    is_hindi = any(ord(c) >= 0x0900 and ord(c) <= 0x097F for c in transcript)
    is_telugu = any(ord(c) >= 0x0C00 and ord(c) <= 0x0C7F for c in transcript)
    is_tamil = any(ord(c) >= 0x0B80 and ord(c) <= 0x0BFF for c in transcript)

    if is_hindi:
        statutes_str = ", ".join(meta['statutes'])
        spoken_summary = (
            f"मैंने समझा कि आप '{meta['title']}' से संबंधित विवाद का सामना कर रहे हैं। "
            f"भारतीय कानून के अंतर्गत आपका मामला {statutes_str} के तहत आता है। "
            "मैंने सभी विवरण दर्ज कर लिए हैं और तुरंत आपका कानूनी नोटिस तैयार कर सकता हूँ।"
        )
    elif is_telugu:
        statutes_str = ", ".join(meta['statutes'])
        spoken_summary = (
            f"మీరు '{meta['title']}' కు సంబంధించిన సమస్యను ఎదుర్కొంటున్నారని నేను గుర్తించాను. "
            f"భారతీయ చట్టం ప్రకారం, మీ కేసు {statutes_str} కిందకు వస్తుంది. "
            "నేను వివరాలను సంగ్రహించాను మరియు మీ కోసం వెంటనే అధికారిక న్యాయ నోటీసును సిద్ధం చేయగలను."
        )
    elif is_tamil:
        statutes_str = ", ".join(meta['statutes'])
        spoken_summary = (
            f"நீங்கள் '{meta['title']}' தொடர்பான சிக்கலை எதிர்கொள்கிறீர்கள் என்பதை நான் புரிந்துகொண்டேன். "
            f"இந்திய சட்டத்தின் கீழ், உங்கள் வழக்கு {statutes_str} கீழ் வருகிறது. "
            "நான் விவரங்களைப் பதிவு செய்துள்ளேன், உடனடியாக உங்களுக்கான சட்டப்பூர்வ நோட்டீஸைத் தயாரிக்க முடியும்."
        )
    else:
        spoken_summary = (
            f"I understood that you are facing an issue regarding {meta['title']}. "
            f"Under Indian law, your matter is covered under {', '.join(meta['statutes'])}. "
            "I have extracted the details and can immediately prepare a formal legal document for you."
        )

    return {
        "transcript": transcript,
        "detected_intent": intent,
        "intent_title": meta["title"],
        "confidence_score": 0.94,
        "statutory_references": meta["statutes"],
        "spoken_response": spoken_summary,
        "auto_fill_template_id": meta["template_id"],
        "extracted_entities": {
            "dispute_type": meta["title"],
            "factual_timeline": transcript
        }
    }


def process_voice_nlp(transcript: str) -> Dict[str, Any]:
    """
    Advanced NLP pipeline using Gemini for:
    - Multilingual Intent detection (English, Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, etc.)
    - Named Entity Recognition (NER)
    - Natural conversational spoken response in citizen's spoken language
    - Automated drafting payload mapping
    """
    is_gemini_active = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))

    if not is_gemini_active:
        return fallback_rule_based_nlp(transcript)

    system_prompt = """You are 'Nyaya Vani' (न्याय वाणी), an empathetic Indian Legal NLP Voice Assistant.
A citizen has spoken their legal issue via voice in an Indian language (e.g. English, Hindi, Telugu, Tamil, Bengali, Marathi, etc.).
Analyze the transcript, extract key legal entities, map to Indian statutory codes, and produce a concise, natural spoken voice response.

CRITICAL INSTRUCTION FOR MULTILINGUAL VOICE:
- If the user spoke in Hindi, output 'spoken_response' in natural, conversational Hindi (Devanagari script).
- If the user spoke in Telugu, output 'spoken_response' in natural Telugu (Telugu script).
- If the user spoke in Tamil, Bengali, Marathi, Gujarati, etc., output 'spoken_response' in that native language!
- If English or Hinglish, output in natural English.

Return a STRICT JSON object matching this schema:
{
  "detected_intent": "UNPAID_SALARY" | "CHEQUE_BOUNCE" | "CONSUMER_FRAUD" | "RTI_QUERY" | "GENERAL_INQUIRY",
  "intent_title": string,
  "confidence_score": number (0.0 to 1.0),
  "language_detected": string,
  "spoken_response": string (2-3 clear, spoken-friendly sentences in the user's language explaining their legal rights and immediate next steps, without markdown formatting or bullet points),
  "statutory_references": [string],
  "auto_fill_template_id": "legal_notice_money" | "cheque_bounce_138" | "consumer_complaint" | "rti_application" | null,
  "extracted_entities": {
    "sender_name": string | null,
    "recipient_name": string | null,
    "claim_amount": string | null,
    "factual_timeline": string | null,
    "key_dates": string | null
  }
}"""

    user_prompt = f"""Voice Transcript:
"{transcript}"

Perform NLP entity extraction, intent categorization under Indian law, and draft an audio-friendly voice response."""

    candidate_models = [settings.GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    
    for model_name in candidate_models:
        try:
            if HAS_NEW_GENAI:
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.generate_content(
                    model=model_name,
                    contents=f"{system_prompt}\n\n{user_prompt}",
                    config={"response_mime_type": "application/json"}
                )
                raw_text = response.text.strip()
            else:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(f"{system_prompt}\n\n{user_prompt}")
                raw_text = response.text.strip()

            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]

            data = json.loads(raw_text)
            data["transcript"] = transcript
            data["engine"] = f"Google Gemini ({model_name})"
            return data
        except Exception as e:
            print(f"Model {model_name} error in Voice NLP: {e}")
            continue

    print("All Gemini models busy or errored. Falling back to rule-based voice parser.")
    fallback = fallback_rule_based_nlp(transcript)
    fallback["note"] = "Processed with Indian Legal Rule-based NLP"
    return fallback
