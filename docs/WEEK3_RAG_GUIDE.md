# NyayaAI — Week 3 RAG Pipeline Guide

## What was built

| File | What it does |
|---|---|
| `backend/app/services/vector_store.py` | ChromaDB singleton — owns all collections |
| `backend/app/services/rag_chain.py` | Core RAG pipeline — retrieve → prompt → cite |
| `backend/app/services/chat_service.py` | Upgraded to use RAG chain + streaming |
| `backend/app/services/llm_router.py` | Upgraded with Ollama fallback to Gemini |
| `backend/app/routers/chat.py` | Added SSE streaming + session endpoints |
| `backend/app/routers/health.py` | Now shows Ollama + ChromaDB status |
| `frontend/src/hooks/use-chat.ts` | SSE streaming hook with abort support |
| `frontend/src/components/chat/chat-window.tsx` | Upgraded — streaming, stop button, 6 suggestions |
| `scripts/seed_legal_data.py` | 20 SC judgments + 15 IPC/CrPC/Constitution sections |

---

## How RAG works in NyayaAI

```
User asks: "What are my rights if arrested?"
         ↓
1. ChromaDB searches nyaya_judgments
   → finds: D.K. Basu (1997), Arnesh Kumar (2014)
   ChromaDB searches nyaya_sections
   → finds: CrPC §41, CrPC §50
         ↓
2. Context block built:
   [Source 1] JUDGMENT — D.K. Basu v. West Bengal...
   [Source 2] JUDGMENT — Arnesh Kumar v. Bihar...
   [Source 3] LAW SECTION — CrPC §41...
         ↓
3. Grounded prompt sent to LLM:
   "Answer ONLY using context below. Cite as [Source N]..."
         ↓
4. LLM (Ollama/Gemini) generates:
   "If arrested, you have the right to... [Source 1]
    Police cannot arrest unless... [Source 2][Source 3]"
         ↓
5. Citation labels extracted:
   ["D.K. Basu v. West Bengal (1997)", "CrPC §41"]
         ↓
6. Streamed to frontend via SSE
   → Typewriter effect in ChatBubble
   → Citation pills shown below response
```

---

## Step-by-step setup (after Week 1 setup)

### 1. Install new Python dependencies

```bash
cd backend
source venv/bin/activate

pip install chromadb sentence-transformers \
  langchain-ollama langchain-google-genai \
  pymupdf httpx
```

### 2. Seed the database

```bash
# From project root
python scripts/seed_legal_data.py

# Expected output:
# Loading embedding model (first run downloads ~90MB)…
# ✅  Seeded 20 judgments
# ✅  Seeded 15 legal sections
#     Judgments : 20
#     Sections  : 15
```

### 3. Make sure Ollama is running with Llama 3

```bash
# Start Ollama (open the app or run:)
ollama serve

# In another terminal — check model is available:
ollama list
# Should show: llama3

# Pull if missing:
ollama pull llama3
```

### 4. Verify health endpoint

```bash
curl http://localhost:8000/health
# Expected:
# {
#   "service": "NyayaAI API",
#   "ollama": true,
#   "chromadb": true,
#   "gemini_key_set": false,
#   "ready": true
# }
```

### 5. Test the RAG endpoint directly

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are my rights if arrested?",
    "language": "en",
    "history": [],
    "user_id": "test"
  }'

# Response should include:
# - "response": answer with [Source N] citations
# - "citations": ["D.K. Basu v. West Bengal (1997)", "CrPC §41"]
# - "model_used": "llama3"
```

### 6. Test Hindi

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "अगर मुझे गिरफ्तार किया जाए तो मेरे क्या अधिकार हैं?",
    "language": "hi",
    "history": [],
    "user_id": "test"
  }'

# This routes to Gemini API (if key set) or Ollama
# Response will be in Hindi with citations
```

---

## Using only Ollama (no Gemini key)

If you don't have a Gemini API key, that's fine.
Set `GEMINI_API_KEY=` (empty) in `backend/.env`.

Ollama will handle ALL languages. Hindi quality will be slightly lower
but still functional.

To get a free Gemini API key:
→ https://aistudio.google.com/app/apikey

---

## What's in ChromaDB after seeding

### Judgments (20)
Maneka Gandhi · Vishaka · D.K. Basu · Arnesh Kumar ·
Satender Kumar Antil · Navtej Singh Johar · K.S. Puttaswamy ·
Shayara Bano · Joseph Shine · Nirbhaya · Lalita Kumari ·
Indira Sawhney · M.C. Mehta · Shreya Singhal ·
State of Maharashtra v. Madhkar · PUCL v. UOI ·
Hussainara Khatoon · Bachan Singh · S.R. Bommai ·
Consumer Education & Research Centre

### Legal Sections (15)
IPC: 302 · 376 · 498A · 420 · 406 · 354 · 307
CrPC: 154 · 41 · 437 · 438
Constitution: Art 21 · Art 14 · Art 19
RTI Act: §6

---

## Adding more judgments

Edit `scripts/seed_legal_data.py` and add to the `JUDGMENTS` list:

```python
{
  "id": "j021",               # unique ID
  "text": "Full case text…",  # what goes into the vector
  "meta": {
    "judgment_id": "j021",
    "case_name": "X v. Y",
    "court": "Supreme Court of India",
    "year": 2023,
    "citation": "(2023) 5 SCC 100",
    "ipc_sections": "IPC 302,Article 21",
    "keywords": "murder,bail,life imprisonment",
  }
},
```

Re-run the seed script — ChromaDB upserts (no duplicates).
