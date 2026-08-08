"""
NyayaAI Documents Router — Week 4
Upload, list, fetch, delete documents.
"""
from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Depends
from app.services.document_service import DocumentService
from app.models.schemas import Language
from app.core.auth import get_current_user_id

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg", "image/jpg", "image/png",
}
MAX_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    case_id: str = Form(None),
    language: str = Form("en"),
    user_id: str = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}. Use PDF, JPEG, or PNG.")

    # Enforce the size limit while reading, instead of buffering the whole
    # file first — a client sending an oversized body would otherwise be
    # fully read into memory before the check below could reject it.
    chunks = []
    total = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_SIZE_BYTES:
            raise HTTPException(413, "File too large. Maximum size is 20 MB.")
        chunks.append(chunk)
    await file.seek(0)

    lang = Language(language) if language in Language._value2member_map_ else Language.EN
    service = DocumentService()
    result = await service.process_upload(file, user_id, case_id, lang)
    return result


@router.get("/list")
async def list_documents(
    case_id: str = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    service = DocumentService()
    docs = await service.list_documents(user_id, case_id)
    return {"documents": docs, "total": len(docs)}


@router.get("/{document_id}")
async def get_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    service = DocumentService()
    doc = await service.get_document(document_id, user_id)
    if not doc:
        raise HTTPException(404, "Document not found.")
    return doc


@router.delete("/{document_id}")
async def delete_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    service = DocumentService()
    ok = await service.delete_document(document_id, user_id)
    if not ok:
        raise HTTPException(404, "Document not found or already deleted.")
    return {"deleted": True, "document_id": document_id}
