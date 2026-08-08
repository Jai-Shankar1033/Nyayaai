"""
NyayaAI Vector Store
Single place that owns all ChromaDB collections.
Lazily initialised so import never fails even without chromadb installed yet.
"""
from __future__ import annotations
import os
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import chromadb

_client: "chromadb.ClientAPI | None" = None


def _get_client():
    global _client
    if _client is None:
        import chromadb as _chromadb
        from chromadb.config import Settings as _ChromaSettings
        from app.core.config import settings
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        _client = _chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=_ChromaSettings(anonymized_telemetry=False),
        )
    return _client


def _embedding_fn():
    from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
    return SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")


def get_judgments_collection():
    return _get_client().get_or_create_collection(
        name="nyaya_judgments",
        embedding_function=_embedding_fn(),
        metadata={"hnsw:space": "cosine"},
    )


def get_sections_collection():
    return _get_client().get_or_create_collection(
        name="nyaya_sections",
        embedding_function=_embedding_fn(),
        metadata={"hnsw:space": "cosine"},
    )


def similarity_search(collection, query: str, n: int = 5) -> list[dict]:
    """Returns list of {document, metadata, score} dicts."""
    results = collection.query(
        query_texts=[query],
        n_results=min(n, collection.count() or 1),
        include=["documents", "metadatas", "distances"],
    )
    out = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        out.append({
            "document": doc,
            "metadata": meta,
            "score": round(1.0 - float(dist), 4),
        })
    return out
