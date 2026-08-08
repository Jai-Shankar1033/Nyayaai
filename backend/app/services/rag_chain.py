"""
NyayaAI RAG Chain
Retrieval-Augmented Generation over Indian legal corpus.

Flow:
  user query
     → retrieve top-K judgments + sections from ChromaDB
     → build grounded prompt with context
     → LLM generates answer citing only retrieved material
     → parse citations from response
     → return answer + citation list
"""
from __future__ import annotations
import re
from dataclasses import dataclass

from app.services.vector_store import (
    get_judgments_collection,
    get_sections_collection,
    similarity_search,
)
from app.services.llm_router import get_llm
from app.models.schemas import Language


@dataclass
class RAGResult:
    answer: str
    citations: list[str]
    context_used: list[dict]
    model_used: str


# ── Prompts ──────────────────────────────────────────────────────

_SYSTEM_EN = """You are NyayaAI, an expert Indian legal AI assistant.

RULES:
- Answer ONLY using the provided legal context below.
- Cite every fact as [Source N] where N matches the context number.
- If the context does not contain the answer, say so honestly — do not invent.
- Use plain language. Many users are ordinary citizens, not lawyers.
- End urgent situations (illegal detention, violence, threats) with: "⚠️ This may be urgent. Please call 100 (Police) or 181 (Women Helpline) immediately."
- Always recommend consulting a licensed advocate for serious matters.

LEGAL CONTEXT:
{context}

USER QUESTION: {question}

Answer:"""

_SYSTEM_HI = """आप NyayaAI हैं — भारतीय कानून के विशेषज्ञ AI सहायक।

नियम:
- केवल नीचे दिए गए कानूनी संदर्भ का उपयोग करके उत्तर दें।
- हर तथ्य को [स्रोत N] से उद्धृत करें।
- अगर संदर्भ में उत्तर नहीं है, तो ईमानदारी से बताएं।
- सरल भाषा में उत्तर दें।
- गंभीर मामलों में वकील से सलाह लेने की सलाह दें।

कानूनी संदर्भ:
{context}

प्रश्न: {question}

उत्तर:"""


def _build_context(judgments: list[dict], sections: list[dict]) -> str:
    """Format retrieved docs into numbered context block."""
    lines = []
    idx = 1
    for j in judgments:
        meta = j["metadata"]
        lines.append(
            f"[Source {idx}] JUDGMENT — {meta.get('case_name', 'Unknown')} "
            f"({meta.get('court', '')}, {meta.get('year', '')}) "
            f"| Citation: {meta.get('citation', 'N/A')}\n{j['document'][:600]}"
        )
        idx += 1
    for s in sections:
        meta = s["metadata"]
        lines.append(
            f"[Source {idx}] LAW SECTION — {meta.get('act', '')} §{meta.get('section', '')} "
            f"— {meta.get('title', '')}\n{s['document'][:400]}"
        )
        idx += 1
    return "\n\n".join(lines) if lines else "No relevant legal context found."


def _extract_citations(text: str, judgments: list[dict], sections: list[dict]) -> list[str]:
    """Pull out [Source N] references and map them to readable labels."""
    nums = set(int(n) for n in re.findall(r'\[(?:Source|स्रोत)\s*(\d+)\]', text))
    all_docs = judgments + sections
    labels = []
    for n in sorted(nums):
        i = n - 1
        if 0 <= i < len(all_docs):
            meta = all_docs[i]["metadata"]
            if i < len(judgments):
                labels.append(f"{meta.get('case_name','?')} ({meta.get('year','')})")
            else:
                labels.append(f"{meta.get('act','')} §{meta.get('section','')}")
    return labels


async def run_rag(
    question: str,
    language: Language = Language.EN,
    top_k: int = 4,
    history: list[dict] | None = None,
) -> RAGResult:
    """Main RAG entry point. Returns RAGResult."""

    # 1 — Retrieve from both collections
    try:
        j_col = get_judgments_collection()
        s_col = get_sections_collection()
        judgments = similarity_search(j_col, question, n=top_k)
        sections = similarity_search(s_col, question, n=2)
    except Exception as e:
        # ChromaDB not seeded yet — fallback gracefully
        judgments, sections = [], []

    # 2 — Build context
    context = _build_context(judgments, sections)

    # 3 — Choose prompt language
    template = _SYSTEM_HI if language == Language.HI else _SYSTEM_EN
    prompt = template.format(context=context, question=question)

    # 4 — Add conversation history if provided
    if history:
        history_text = "\n".join(
            f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
            for m in history[-6:]
        )
        prompt = f"Conversation so far:\n{history_text}\n\n{prompt}"

    # 5 — Call LLM
    llm = get_llm(language=language, task="standard")
    model_name = (
        "gemini-1.5-flash"
        if language in {Language.HI, Language.TA, Language.TE, Language.BN}
        else "llama3"
    )

    try:
        response = llm.invoke(prompt)
        answer = response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        answer = (
            f"माफ़ करें, अभी उत्तर देने में समस्या है: {e}"
            if language == Language.HI
            else f"Sorry, I couldn't generate a response right now. ({e})"
        )

    # 6 — Extract citations
    citations = _extract_citations(answer, judgments, sections)

    return RAGResult(
        answer=answer,
        citations=citations,
        context_used=judgments + sections,
        model_used=model_name,
    )
