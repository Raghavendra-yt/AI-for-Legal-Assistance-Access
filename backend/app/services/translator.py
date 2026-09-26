import json
from typing import Dict, Any
from app.core.config import settings

try:
    from google import genai
    HAS_NEW_GENAI = True
except ImportError:
    import google.generativeai as genai
    HAS_NEW_GENAI = False

LANGUAGE_NAMES = {
    "hi": "Hindi (हिन्दी)",
    "te": "Telugu (తెలుగు)",
    "ta": "Tamil (தமிழ்)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "bn": "Bengali (বাংলা)",
    "mr": "Marathi (मराठी)",
    "gu": "Gujarati (ગુજરાતી)",
    "ml": "Malayalam (മലയാളം)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "en": "English"
}

_translation_cache: Dict[tuple, Dict[str, Any]] = {}

def translate_legal_text(text: str, target_lang: str) -> Dict[str, Any]:
    """
    Translates legal notice, advice, or citizen query into target Indian language
    maintaining legal terminology and formal court phrasing with caching.
    """
    cache_key = (text.strip(), target_lang.strip().lower())
    if cache_key in _translation_cache:
        cached = _translation_cache[cache_key].copy()
        cached["cached"] = True
        return cached

    lang_name = LANGUAGE_NAMES.get(target_lang, target_lang)

    is_gemini_active = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))
    if not is_gemini_active:
        res = {
            "translated_text": text,
            "target_language": target_lang,
            "target_language_name": lang_name,
            "note": "AI key required for deep text translation"
        }
        _translation_cache[cache_key] = res
        return res

    system_prompt = f"""You are an expert bilingual Indian advocate and official legal translator.
Translate the following legal notice, citizen query, or legal guidance accurately into {lang_name}.

CRITICAL RULES:
1. Preserve formal legal gravitas and court format.
2. In {lang_name}, preserve legal section references (e.g. 'धारा 138', 'Section 138', 'సెక్షన్ 138', 'CPA 2019', 'BNSS', 'BNS') clearly alongside the translated text.
3. Keep party names, addresses, dates, and currency amounts (₹) accurate and clear.
4. Return ONLY the translated text without extra conversational commentary."""

    candidate_models = [settings.GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    for model_name in candidate_models:
        try:
            if HAS_NEW_GENAI:
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.generate_content(
                    model=model_name,
                    contents=f"{system_prompt}\n\nText to translate:\n{text}",
                )
                translated = response.text.strip()
            else:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(f"{system_prompt}\n\nText to translate:\n{text}")
                translated = response.text.strip()

            if translated:
                res = {
                    "translated_text": translated,
                    "target_language": target_lang,
                    "target_language_name": lang_name,
                    "engine": f"Gemini ({model_name})"
                }
                _translation_cache[cache_key] = res
                return res
        except Exception as e:
            print(f"Translation error with {model_name}: {e}")
            continue

    fallback_res = {
        "translated_text": text,
        "target_language": target_lang,
        "target_language_name": lang_name,
        "note": "Translation fallback"
    }
    _translation_cache[cache_key] = fallback_res
    return fallback_res
