"""
NyayaAI Chat Service — Week 3 upgrade
Now powered by the RAG chain instead of plain LLM.
"""
from __future__ import annotations
import uuid

from app.models.schemas import ChatRequest, ChatResponse, Language
from app.services.rag_chain import run_rag
from app.core.supabase import get_supabase


class ChatService:
    def __init__(self):
        self.supabase = get_supabase()

    async def chat(self, request: ChatRequest) -> ChatResponse:
        session_id = request.session_id or str(uuid.uuid4())

        # Build history list for context
        history = [{"role": m.role, "content": m.content} for m in request.history[-8:]]

        # Run RAG
        result = await run_rag(
            question=request.message,
            language=request.language,
            history=history,
        )

        # Persist session asynchronously (best-effort)
        await self._save_session(session_id, request, result.answer)

        return ChatResponse(
            session_id=session_id,
            response=result.answer,
            citations=result.citations,
            language=request.language,
            model_used=result.model_used,
        )

    async def chat_stream(self, request: ChatRequest):
        """Streaming version — yields text chunks."""
        from app.services.llm_router import get_llm
        from app.services.rag_chain import (
            get_judgments_collection, get_sections_collection,
            similarity_search, _build_context, _SYSTEM_EN, _SYSTEM_HI,
        )

        try:
            judgments = similarity_search(get_judgments_collection(), request.message, n=4)
            sections  = similarity_search(get_sections_collection(), request.message, n=2)
        except Exception:
            judgments, sections = [], []

        context = _build_context(judgments, sections)
        template = _SYSTEM_HI if request.language == Language.HI else _SYSTEM_EN
        prompt = template.format(context=context, question=request.message)

        llm = get_llm(language=request.language, task="standard")
        try:
            async for chunk in llm.astream(prompt):
                yield chunk.content if hasattr(chunk, "content") else str(chunk)
        except Exception as e:
            yield f"\n[Error: {e}]"

    async def _save_session(self, session_id: str, request: ChatRequest, response: str):
        try:
            existing = self.supabase.table("chat_sessions") \
                .select("messages").eq("id", session_id).execute()
            current_msgs = existing.data[0]["messages"] if existing.data else []

            new_msgs = current_msgs + [
                {"id": str(uuid.uuid4()), "role": "user",
                 "content": request.message, "language": request.language, "timestamp": ""},
                {"id": str(uuid.uuid4()), "role": "assistant",
                 "content": response, "language": request.language, "timestamp": ""},
            ]
            self.supabase.table("chat_sessions").upsert({
                "id": session_id,
                "user_id": request.user_id,
                "language": request.language,
                "messages": new_msgs,
            }).execute()
        except Exception:
            pass  # non-critical
