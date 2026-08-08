"""
NyayaAI Research Service — Week 3 upgrade
Semantic judgment search using ChromaDB vector store.
"""
from __future__ import annotations

from app.models.schemas import ResearchRequest, ResearchResponse, ResearchResult
from app.services.vector_store import get_judgments_collection, similarity_search
from app.core.supabase import get_supabase


class ResearchService:
    def __init__(self):
        self.supabase = get_supabase()

    async def search(self, request: ResearchRequest) -> ResearchResponse:
        try:
            col = get_judgments_collection()
            hits = similarity_search(col, request.query, n=request.top_k)
        except Exception as e:
            return ResearchResponse(query=request.query, results=[], total=0)

        results = []
        for hit in hits:
            meta = hit["metadata"]
            results.append(ResearchResult(
                judgment_id=meta.get("judgment_id", "unknown"),
                case_name=meta.get("case_name", "Unknown"),
                court=meta.get("court", "Unknown"),
                year=int(meta.get("year", 0)),
                relevance_score=hit["score"],
                excerpt=hit["document"][:450],
                citation=meta.get("citation"),
                ipc_sections=[
                    s.strip() for s in meta.get("ipc_sections", "").split(",")
                    if s.strip()
                ],
            ))

        # Sort by relevance score descending
        results.sort(key=lambda r: r.relevance_score, reverse=True)

        return ResearchResponse(
            query=request.query,
            results=results,
            total=len(results),
        )

    async def get_judgment(self, judgment_id: str):
        result = self.supabase \
            .table("judgments") \
            .select("*") \
            .eq("id", judgment_id) \
            .single() \
            .execute()
        return result.data
