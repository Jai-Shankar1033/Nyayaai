"""
NyayaAI Chat Router — Week 3 upgrade
Adds SSE streaming endpoint and better error handling.
"""
from __future__ import annotations
import json

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.core.auth import get_current_user_id

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Standard request/response chat."""
    try:
        service = ChatService()
        return await service.chat(request)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {e}")


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    Server-Sent Events streaming chat.
    Client receives: data: {"chunk": "..."}\n\n
    Ends with:       data: [DONE]\n\n
    """
    service = ChatService()

    async def generate():
        try:
            async for chunk in service.chat_stream(request):
                if chunk:
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/sessions/{user_id}")
async def get_sessions(user_id: str, authed_user_id: str = Depends(get_current_user_id)):
    """Fetch all chat sessions for a user."""
    if user_id != authed_user_id:
        raise HTTPException(403, "Cannot access another user's chat sessions.")
    from app.core.supabase import get_supabase
    supabase = get_supabase()
    result = supabase \
        .table("chat_sessions") \
        .select("id, title, language, created_at, updated_at") \
        .eq("user_id", user_id) \
        .order("updated_at", desc=True) \
        .limit(20) \
        .execute()
    return {"sessions": result.data}


@router.get("/sessions/{user_id}/{session_id}")
async def get_session(user_id: str, session_id: str, authed_user_id: str = Depends(get_current_user_id)):
    """Fetch a single session with full message history."""
    if user_id != authed_user_id:
        raise HTTPException(403, "Cannot access another user's chat sessions.")
    from app.core.supabase import get_supabase
    supabase = get_supabase()
    result = supabase \
        .table("chat_sessions") \
        .select("*") \
        .eq("id", session_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(404, "Session not found")
    return result.data
