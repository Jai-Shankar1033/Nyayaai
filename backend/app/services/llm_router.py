"""
NyayaAI LLM Router — Week 3 upgrade
Smart routing between Ollama (free, local) and Gemini API (premium).

Decision tree:
  Hindi / Tamil / Telugu / Bengali  →  Gemini (better multilingual)
  task == "complex" + key set       →  Gemini
  everything else                   →  Ollama (Llama 3, free)
  Ollama fails (not running)        →  fallback to Gemini if key set
"""
from __future__ import annotations
from functools import lru_cache
from app.core.config import settings
from app.models.schemas import Language

_GEMINI_LANGS = {Language.HI, Language.TA, Language.TE, Language.BN}


def get_llm(language: Language = Language.EN, task: str = "standard"):
    use_gemini = (
        language in _GEMINI_LANGS
        or (task == "complex" and bool(settings.GEMINI_API_KEY))
    )

    if use_gemini and settings.GEMINI_API_KEY:
        return _make_gemini()

    try:
        return _make_ollama()
    except Exception:
        # Ollama not running — fall back to Gemini if available
        if settings.GEMINI_API_KEY:
            return _make_gemini()
        raise RuntimeError(
            "No LLM available. "
            "Either start Ollama (https://ollama.ai) or set GEMINI_API_KEY in backend/.env"
        )


def _make_ollama():
    from langchain_ollama import OllamaLLM
    return OllamaLLM(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.OLLAMA_MODEL,
        temperature=0.2,
        num_predict=1024,
    )


def _make_gemini():
    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
        max_output_tokens=1024,
    )


@lru_cache(maxsize=1)
def get_embedding_model():
    """Cached sentence-transformers model for vector ops."""
    from langchain_community.embeddings import HuggingFaceEmbeddings
    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
