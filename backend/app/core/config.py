from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ENV: str = "development"

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str

    # AI providers
    GEMINI_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./data/chroma"
    CHROMA_COLLECTION_JUDGMENTS: str = "nyaya_judgments"
    CHROMA_COLLECTION_SECTIONS: str = "nyaya_sections"

    # App
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://nyayaai.vercel.app"]
    MAX_UPLOAD_SIZE_MB: int = 20
    MAX_CHAT_HISTORY: int = 20

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
