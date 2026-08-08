"""
NyayaAI Document Service — Week 4
Full pipeline: upload → storage → OCR → chunk → embed → summarise → structured extract
"""
from __future__ import annotations
import uuid, re, json
from typing import Optional
from fastapi import UploadFile

from app.core.supabase import get_supabase
from app.core.config import settings
from app.services.llm_router import get_llm
from app.services.vector_store import get_judgments_collection
from app.models.schemas import Language


# ── OCR ─────────────────────────────────────────────────────────

def extract_text_from_pdf(contents: bytes) -> str | None:
    """Extract text from PDF bytes using PyMuPDF."""
    try:
        import pymupdf  # fitz
        doc = pymupdf.open(stream=contents, filetype="pdf")
        pages = []
        for page in doc:
            text = page.get_text("text")
            if text.strip():
                pages.append(text.strip())
        return "\n\n".join(pages) if pages else None
    except Exception as e:
        print(f"[OCR] PyMuPDF error: {e}")
        return None


def extract_text_from_image(contents: bytes, mime_type: str) -> str | None:
    """Extract text from image using pytesseract (optional)."""
    try:
        import pytesseract
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(contents))
        return pytesseract.image_to_string(img, lang="eng+hin") or None
    except Exception as e:
        print(f"[OCR] Tesseract error (install pytesseract for image OCR): {e}")
        return None


def extract_text(contents: bytes, mime_type: str) -> str | None:
    if mime_type == "application/pdf":
        return extract_text_from_pdf(contents)
    elif mime_type in ("image/jpeg", "image/png", "image/jpg"):
        return extract_text_from_image(contents, mime_type)
    return None


# ── AI ANALYSIS ──────────────────────────────────────────────────

ANALYSIS_PROMPT = """You are NyayaAI, an expert in Indian law. Analyse this legal document carefully.

Respond ONLY with valid JSON — no markdown, no preamble, no explanation outside the JSON.

JSON schema:
{{
  "document_type": "one of: FIR | Legal Notice | Court Order | Affidavit | Contract | Judgment | Petition | Bail Application | RTI | Other",
  "summary": "2-3 sentences in plain language explaining what this document is about",
  "summary_hindi": "same summary in Hindi (Devanagari script)",
  "parties": ["list of names of all parties mentioned"],
  "ipc_sections": ["list of IPC/BNS/CrPC section numbers mentioned e.g. 302, 498A"],
  "key_dates": ["list of important dates mentioned in DD/MM/YYYY format"],
  "action_required": "what the recipient of this document must do, if anything",
  "urgency": "low | medium | high",
  "lawyer_needed": true/false,
  "key_clauses": ["for contracts: list of up to 5 important clauses"],
  "risk_flags": ["list of concerning items the reader should know about"]
}}

DOCUMENT TEXT:
{text}"""


async def analyse_document(text: str, language: Language = Language.EN) -> dict:
    """Run AI analysis on extracted document text."""
    llm = get_llm(language=language, task="complex")
    truncated = text[:6000]  # keep within context window

    prompt = ANALYSIS_PROMPT.format(text=truncated)
    try:
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        # Strip any markdown fences
        clean = re.sub(r"```(?:json)?|```", "", content).strip()
        # Find first { ... }
        match = re.search(r"\{.*\}", clean, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception as e:
        print(f"[Analysis] Error: {e}")

    return {
        "document_type": "Unknown",
        "summary": "Could not analyse document. Please try again.",
        "summary_hindi": "दस्तावेज़ का विश्लेषण नहीं हो सका।",
        "parties": [],
        "ipc_sections": [],
        "key_dates": [],
        "action_required": "",
        "urgency": "low",
        "lawyer_needed": False,
        "key_clauses": [],
        "risk_flags": [],
    }


# ── EMBEDDING ────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks for embedding."""
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return chunks


def embed_document(doc_id: str, text: str):
    """Embed document chunks into ChromaDB for semantic search.

    Reuses the shared Chroma client from vector_store.py instead of opening
    a second PersistentClient against the same on-disk path — running two
    separate clients against one SQLite-backed store risks lock contention
    and inconsistent state.
    """
    try:
        from app.services.vector_store import _get_client, _embedding_fn

        client = _get_client()
        col = client.get_or_create_collection(
            name="nyaya_user_docs",
            embedding_function=_embedding_fn(),
            metadata={"hnsw:space": "cosine"},
        )
        chunks = chunk_text(text)
        ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
        metas = [{"doc_id": doc_id, "chunk_idx": i} for i in range(len(chunks))]
        col.upsert(ids=ids, documents=chunks, metadatas=metas)
        print(f"[Embed] Embedded {len(chunks)} chunks for doc {doc_id}")
    except Exception as e:
        print(f"[Embed] Error: {e}")


# ── MAIN SERVICE ─────────────────────────────────────────────────

class DocumentService:
    def __init__(self):
        self.supabase = get_supabase()

    async def process_upload(
        self,
        file: UploadFile,
        user_id: str,
        case_id: Optional[str] = None,
        language: Language = Language.EN,
    ) -> dict:
        doc_id = str(uuid.uuid4())
        contents = await file.read()

        # 1 — Upload raw file to Supabase Storage
        storage_path = f"{user_id}/{doc_id}/{file.filename}"
        try:
            self.supabase.storage.from_("documents").upload(
                path=storage_path,
                file=contents,
                file_options={"content-type": file.content_type},
            )
            file_url = self.supabase.storage.from_("documents").get_public_url(storage_path)
        except Exception as e:
            print(f"[Storage] Upload error: {e}")
            file_url = ""

        # 2 — Extract text
        ocr_text = extract_text(contents, file.content_type or "application/pdf")

        # 3 — AI analysis
        analysis = {}
        if ocr_text and len(ocr_text.strip()) > 80:
            analysis = await analyse_document(ocr_text, language)

        summary = analysis.get("summary") or "No summary available."
        summary_hindi = analysis.get("summary_hindi", "")

        # 4 — Save to Supabase
        try:
            self.supabase.table("documents").insert({
                "id": doc_id,
                "user_id": user_id,
                "case_id": case_id,
                "file_name": file.filename,
                "file_url": file_url,
                "file_size": len(contents),
                "mime_type": file.content_type or "application/octet-stream",
                "ocr_text": ocr_text,
                "summary": summary,
                "embedding_status": "pending",
            }).execute()
        except Exception as e:
            print(f"[DB] Insert error: {e}")

        # 5 — Embed in background (best effort)
        if ocr_text:
            try:
                embed_document(doc_id, ocr_text)
                self.supabase.table("documents").update(
                    {"embedding_status": "done"}
                ).eq("id", doc_id).execute()
            except Exception as e:
                print(f"[DB] embedding_status update error for doc {doc_id}: {e}")

        return {
            "document_id": doc_id,
            "file_name": file.filename,
            "file_size": len(contents),
            "file_url": file_url,
            "ocr_text_preview": (ocr_text or "")[:400],
            "ocr_success": bool(ocr_text),
            "summary": summary,
            "summary_hindi": summary_hindi,
            "document_type": analysis.get("document_type", "Unknown"),
            "parties": analysis.get("parties", []),
            "ipc_sections": analysis.get("ipc_sections", []),
            "key_dates": analysis.get("key_dates", []),
            "action_required": analysis.get("action_required", ""),
            "urgency": analysis.get("urgency", "low"),
            "lawyer_needed": analysis.get("lawyer_needed", False),
            "key_clauses": analysis.get("key_clauses", []),
            "risk_flags": analysis.get("risk_flags", []),
        }

    async def get_document(self, doc_id: str, user_id: str) -> dict | None:
        result = self.supabase.table("documents").select("*") \
            .eq("id", doc_id).eq("user_id", user_id).single().execute()
        return result.data

    async def list_documents(self, user_id: str, case_id: Optional[str] = None) -> list:
        q = self.supabase.table("documents").select(
            "id, file_name, file_size, mime_type, summary, embedding_status, created_at"
        ).eq("user_id", user_id)
        if case_id:
            q = q.eq("case_id", case_id)
        result = q.order("created_at", desc=True).limit(50).execute()
        return result.data or []

    async def delete_document(self, doc_id: str, user_id: str) -> bool:
        try:
            self.supabase.table("documents").delete() \
                .eq("id", doc_id).eq("user_id", user_id).execute()
            return True
        except Exception:
            return False
