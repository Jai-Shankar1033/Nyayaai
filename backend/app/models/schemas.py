from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class Language(str, Enum):
    EN = "en"
    HI = "hi"
    TA = "ta"
    TE = "te"
    BN = "bn"


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    language: Language = Language.EN
    history: List[ChatMessage] = []
    user_id: str


class ChatResponse(BaseModel):
    session_id: str
    response: str
    citations: List[str] = []
    language: Language
    model_used: str


class DocumentUploadResponse(BaseModel):
    document_id: str
    file_name: str
    ocr_text: Optional[str] = None
    summary: Optional[str] = None
    key_sections: List[str] = []
    parties: List[str] = []


class ResearchRequest(BaseModel):
    query: str
    filters: Optional[dict] = None
    top_k: int = Field(default=5, ge=1, le=20)
    user_id: str


class ResearchResult(BaseModel):
    judgment_id: str
    case_name: str
    court: str
    year: int
    relevance_score: float
    excerpt: str
    citation: Optional[str] = None
    ipc_sections: List[str] = []


class ResearchResponse(BaseModel):
    query: str
    results: List[ResearchResult]
    total: int


class DraftRequest(BaseModel):
    draft_type: str  # "rti" | "fir_complaint" | "bail_application" | "notice"
    context: dict
    language: Language = Language.EN
    user_id: str


class DraftResponse(BaseModel):
    draft_type: str
    content: str
    language: Language
    word_count: int
