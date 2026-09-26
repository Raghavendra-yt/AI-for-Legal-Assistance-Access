import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root or backend directory
root_dir = Path(__file__).resolve().parent.parent.parent.parent
backend_dir = Path(__file__).resolve().parent.parent.parent

load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

class Settings:
    PROJECT_NAME: str = "NyayaSahayak - AI for Legal Assistance & Access"
    VERSION: str = "1.0.0"
    JURISDICTION: str = os.getenv("DEFAULT_JURISDICTION", "IN")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    PORT: int = int(os.getenv("PORT", 8000))
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    ]

settings = Settings()
