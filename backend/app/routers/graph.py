"""
NyayaAI Citation Graph Router
Returns judgment nodes + citation edges for D3 force graph visualization.
"""
from __future__ import annotations
from fastapi import APIRouter, Query
from app.services.vector_store import get_judgments_collection

router = APIRouter()

# Static citation relationships between seeded judgments
# format: (from_id, to_id, type)
CITATION_EDGES = [
    ("j004", "j003", "followed"),      # Arnesh Kumar follows D.K. Basu
    ("j005", "j003", "followed"),      # Satender Antil follows D.K. Basu
    ("j005", "j004", "followed"),      # Satender Antil follows Arnesh Kumar
    ("j005", "j017", "followed"),      # Satender Antil follows Hussainara Khatoon
    ("j006", "j001", "followed"),      # Navtej Johar follows Maneka Gandhi
    ("j006", "j007", "followed"),      # Navtej Johar follows Puttaswamy
    ("j007", "j001", "followed"),      # Puttaswamy follows Maneka Gandhi
    ("j009", "j002", "followed"),      # Joseph Shine follows Vishaka
    ("j014", "j001", "followed"),      # Shreya Singhal follows Maneka Gandhi
    ("j018", "j001", "followed"),      # Bachan Singh follows Maneka Gandhi
    ("j010", "j018", "followed"),      # Nirbhaya follows Bachan Singh
    ("j011", "j003", "followed"),      # Lalita Kumari follows D.K. Basu
    ("j016", "j001", "followed"),      # PUCL follows Maneka Gandhi
    ("j017", "j001", "followed"),      # Hussainara follows Maneka Gandhi
    ("j008", "j001", "followed"),      # Shayara Bano follows Maneka Gandhi
    ("j013", "j001", "followed"),      # M.C. Mehta follows Maneka Gandhi
    ("j020", "j016", "followed"),      # Consumer Education follows PUCL
    ("j003", "j001", "followed"),      # D.K. Basu follows Maneka Gandhi
    ("j015", "j002", "distinguished"), # Madhkar Narayan distinguishes Vishaka
    ("j012", "j019", "followed"),      # Indira Sawhney follows S.R. Bommai
]

COLORS = {
    "fundamental_rights": "#7c3aed",
    "criminal_law":       "#0d9488",
    "bail_rights":        "#d97706",
    "women_rights":       "#db2777",
    "environment":        "#16a34a",
    "constitutional":     "#2563eb",
}

CATEGORIES = {
    "j001": "fundamental_rights", "j006": "fundamental_rights",
    "j007": "fundamental_rights", "j014": "fundamental_rights",
    "j016": "fundamental_rights", "j017": "fundamental_rights",
    "j020": "fundamental_rights",
    "j003": "criminal_law",  "j004": "criminal_law",
    "j010": "criminal_law",  "j011": "criminal_law",
    "j015": "criminal_law",  "j018": "criminal_law",
    "j005": "bail_rights",
    "j002": "women_rights",  "j008": "women_rights",
    "j009": "women_rights",
    "j013": "environment",
    "j012": "constitutional","j019": "constitutional",
}


@router.get("/citations")
async def get_citation_graph(query: str = Query(None)):
    """Return nodes + edges for D3 force graph."""
    try:
        col = get_judgments_collection()
        all_metas = col.get(include=["metadatas"])["metadatas"]
        all_ids   = col.get(include=["metadatas"])["ids"]
    except Exception:
        all_metas, all_ids = [], []

    # Build lookup id → metadata
    meta_map = {id_: m for id_, m in zip(all_ids, all_metas)}

    # If query supplied, filter to relevant judgments + their neighbors
    relevant_ids = set(meta_map.keys())
    if query:
        try:
            hits = col.query(query_texts=[query], n_results=8,
                             include=["metadatas"])
            relevant_ids = {m.get("judgment_id") for m in hits["metadatas"][0]}
            # Add neighbors
            for (f, t, _) in CITATION_EDGES:
                if f in relevant_ids or t in relevant_ids:
                    relevant_ids.add(f); relevant_ids.add(t)
        except Exception:
            pass

    nodes = []
    for id_, meta in meta_map.items():
        jid = meta.get("judgment_id", id_)
        if jid not in relevant_ids:
            continue
        cat = CATEGORIES.get(jid, "fundamental_rights")
        nodes.append({
            "id":       jid,
            "label":    meta.get("case_name", "Unknown"),
            "court":    meta.get("court", ""),
            "year":     meta.get("year", 0),
            "citation": meta.get("citation", ""),
            "category": cat,
            "color":    COLORS.get(cat, "#7c3aed"),
        })

    edges = [
        {"source": f, "target": t, "type": typ}
        for (f, t, typ) in CITATION_EDGES
        if f in relevant_ids and t in relevant_ids
    ]

    return {
        "nodes": nodes,
        "edges": edges,
        "categories": [{"key": k, "color": v} for k, v in COLORS.items()],
    }
