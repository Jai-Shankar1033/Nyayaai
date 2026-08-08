"""
Health check endpoint — shows status of all dependencies.
"""
from __future__ import annotations
import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("")
async def health_check():
    status = {
        "service": "NyayaAI API",
        "env": settings.ENV,
        "ollama": await _check_ollama(),
        "chromadb": _check_chroma(),
        "gemini_key_set": bool(settings.GEMINI_API_KEY),
    }
    all_ok = status["ollama"] or status["gemini_key_set"]
    status["ready"] = all_ok
    return status


async def _check_ollama() -> bool:
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


def _check_chroma() -> bool:
    try:
        from app.services.vector_store import get_judgments_collection
        col = get_judgments_collection()
        return col.count() >= 0
    except Exception:
        return False
