from fastapi import APIRouter, HTTPException
from app.models.schemas import ResearchRequest, ResearchResponse
from app.services.research_service import ResearchService

router = APIRouter()


@router.post("/search", response_model=ResearchResponse)
async def search_judgments(request: ResearchRequest):
    service = ResearchService()
    return await service.search(request)


@router.get("/judgment/{judgment_id}")
async def get_judgment(judgment_id: str):
    service = ResearchService()
    judgment = await service.get_judgment(judgment_id)
    if not judgment:
        raise HTTPException(404, "Judgment not found")
    return judgment
