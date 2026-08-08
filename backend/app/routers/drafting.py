"""
NyayaAI Drafting Router — Week 5 upgrade
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from app.models.schemas import DraftRequest, DraftResponse
from app.services.drafting_service import DraftingService, DRAFT_LABELS

router = APIRouter()


@router.get("/types")
async def list_draft_types():
    service = DraftingService()
    return {"types": service.list_types()}


@router.get("/fields/{draft_type}")
async def get_fields(draft_type: str):
    if draft_type not in DRAFT_LABELS:
        raise HTTPException(404, f"Unknown draft type: {draft_type}")
    service = DraftingService()
    return {
        "draft_type": draft_type,
        "label": DRAFT_LABELS[draft_type],
        "fields": service.get_fields(draft_type),
    }


@router.post("/generate", response_model=DraftResponse)
async def generate_draft(request: DraftRequest):
    service = DraftingService()
    return await service.generate(request)
