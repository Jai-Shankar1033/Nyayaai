<div align="center">

<img width="60" src="https://raw.githubusercontent.com/yourusername/nyayaai/main/docs/logo.png" alt="NyayaAI" />

# न्याय AI — NyayaAI

**India's AI-Powered Legal Intelligence Platform**

*Legal intelligence for every Indian — citizens, lawyers, and corporates.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C)](https://langchain.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-FF6B35)](https://www.trychroma.com)
[![Ollama](https://img.shields.io/badge/Ollama-Llama_3-FF6B35)](https://ollama.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

[Live Demo](#) · [Architecture](#architecture) · [Setup](#local-setup) · [API Docs](#api-docs) · [Roadmap](#roadmap)

<br/>

<!-- Replace with actual screenshot -->
> *A unified platform connecting citizens, lawyers, and the Indian legal system through AI.*

</div>

---

## What is NyayaAI?

India has **5 crore+ pending cases**, most citizens **don't understand legal language**, and lawyers **manually search thousands of judgments**. NyayaAI fixes all three.

| Role | What they get |
|------|---------------|
| 🧑‍🤝‍🧑 **Citizens** | Ask legal questions in Hindi · Upload FIRs and notices · Draft RTI/complaints |
| ⚖️ **Lawyers** | Semantic judgment search · AI drafting · Document analysis · Citation graph |
| 🏢 **Corporates** | Contract risk analysis · Clause detection · Compliance alerts |

---

## Features

### For Citizens
- 💬 **AI Legal Chat** — Ask in Hindi or English, get answers citing real Supreme Court judgments
- 📄 **Document Analysis** — Upload any PDF (FIR, notice, order) → AI extracts parties, IPC sections, dates, risks, and next steps
- ✍️ **Draft Generator** — Generate RTI applications, FIR complaints, affidavits, and consumer complaints in minutes
- 🗣️ **Hindi First** — Devanagari responses, Hindi suggested questions, language toggle on every screen

### For Lawyers
- 🔍 **Semantic Research** — Search 20+ landmark SC judgments by meaning, not just keywords
- 🕸️ **Citation Graph** — Interactive force-directed graph showing how judgments cite each other
- 📋 **7 Document Types** — Bail applications, vakalatnamas, legal notices, and more
- 📊 **Document Intelligence** — Side-by-side upload + structured analysis panel

### Technical
- 🤖 **RAG Architecture** — Retrieval-Augmented Generation ensures AI answers from real legal corpus, never hallucinates
- ⚡ **SSE Streaming** — Token-by-token streaming with typewriter effect in UI
- 🔐 **Row-Level Security** — Every Supabase table protected by RLS policies
- 🌐 **Multilingual** — Language-based LLM routing (Ollama for EN, Gemini for Hindi/regional)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 App Router                │
│         Tailwind · Shadcn/UI · Framer Motion            │
│         Supabase SSR Auth · Route protection            │
└──────────────┬──────────────────────────────────────────┘
               │ fetch / SSE
┌──────────────▼──────────────────────────────────────────┐
│                  FastAPI (Python 3.12)                  │
│    /api/chat  /api/documents  /api/research             │
│    /api/drafting  /api/graph                            │
└────────┬────────────────────┬───────────────────────────┘
         │                    │
┌────────▼──────┐    ┌────────▼──────────────────────────┐
│  LangChain    │    │         RAG Chain                  │
│  Orchestrator │    │  1. ChromaDB semantic search       │
│               │    │  2. Build grounded context         │
│  ┌──────────┐ │    │  3. LLM generates cited answer     │
│  │  Ollama  │ │    │  4. Parse [Source N] citations     │
│  │  Llama 3 │ │    └────────────────────────────────────┘
│  └──────────┘ │
│  ┌──────────┐ │    ┌─────────────────────────────────────┐
│  │  Gemini  │ │    │  Supabase (PostgreSQL)               │
│  │  1.5F    │ │    │  profiles · cases · documents        │
│  └──────────┘ │    │  judgments · chat_sessions           │
└───────────────┘    │  contracts · citations · sections    │
                     └─────────────────────────────────────┘
                     ┌─────────────────────────────────────┐
                     │  ChromaDB (Vector DB)                │
                     │  nyaya_judgments · nyaya_sections    │
                     │  nyaya_user_docs                     │
                     └─────────────────────────────────────┘
```

### LLM Routing Logic
```
User language = Hindi/Tamil/Telugu/Bengali  →  Gemini 1.5 Flash
Complex task (drafting) + GEMINI_API_KEY    →  Gemini 1.5 Flash
Standard English task                       →  Ollama (Llama 3, free)
Ollama not running                          →  Auto-fallback to Gemini
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion |
| Backend | FastAPI, Python 3.12, Pydantic v2, Uvicorn |
| AI Orchestration | LangChain 0.3, LangChain-Ollama, LangChain-Google-GenAI |
| LLMs | Ollama (Llama 3, local/free) + Gemini 1.5 Flash (premium) |
| Vector DB | ChromaDB + sentence-transformers (all-MiniLM-L6-v2) |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime + RLS) |
| OCR | PyMuPDF (PDF text) + pytesseract (scanned images) |
| Deployment | Vercel (frontend) · Railway/Render (backend) |
| CI/CD | GitHub Actions |

---

## Local Setup

### Prerequisites

- Node.js 20+
- Python 3.12+
- [Ollama](https://ollama.ai) installed and running
- [Supabase](https://supabase.com) free account

### 1. Clone

```bash
git clone https://github.com/yourusername/nyayaai.git
cd nyayaai
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY
# Optionally add GEMINI_API_KEY for Hindi support
```

### 4. Supabase schema

```
Supabase Dashboard → SQL Editor → New query
Paste: docs/supabase-schema.sql → Run
```

### 5. Seed AI knowledge base

```bash
# Pull AI model (one time, ~4GB)
ollama pull llama3

# Seed ChromaDB with 20 judgments + 15 legal sections
cd backend && python ../scripts/seed_legal_data.py
```

### 6. Start

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev          # → http://localhost:3000

# Terminal 2 — Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000   # → http://localhost:8000
```

### 7. Verify

| Check | URL | Expected |
|-------|-----|----------|
| Frontend | http://localhost:3000 | Landing page |
| API health | http://localhost:8000/health | `{"ollama": true, "chromadb": true}` |
| API docs | http://localhost:8000/docs | Swagger UI |

---

## API Docs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | RAG-powered legal chat |
| `/api/chat/stream` | POST | SSE streaming chat |
| `/api/chat/sessions/{user_id}` | GET | List chat history |
| `/api/documents/upload` | POST | Upload + OCR + AI analysis |
| `/api/documents/list` | GET | List user documents |
| `/api/research/search` | POST | Semantic judgment search |
| `/api/drafting/types` | GET | List draft types |
| `/api/drafting/fields/{type}` | GET | Get form fields for type |
| `/api/drafting/generate` | POST | Generate legal draft |
| `/api/graph/citations` | GET | Citation graph data |
| `/health` | GET | Dependency status |

---

## Project Structure

```
nyayaai/
├── frontend/                    # Next.js 14
│   └── src/
│       ├── app/
│       │   ├── (auth)/          # Login, signup
│       │   ├── (dashboard)/     # Citizen + lawyer dashboards
│       │   │   ├── citizen/     # chat, documents, draft
│       │   │   └── lawyer/      # chat, research, documents,
│       │   │                    # draft, citations
│       │   └── page.tsx         # Landing page
│       ├── components/
│       │   ├── chat/            # ChatWindow, bubbles, input
│       │   ├── documents/       # Upload zone, analysis card
│       │   ├── draft/           # Type selector, form, output
│       │   ├── graph/           # Citation canvas graph
│       │   ├── layout/          # Sidebar, shell, theme
│       │   └── ui/              # Skeleton, toast, primitives
│       ├── hooks/               # useUser, useChat, useLanguage
│       └── types/               # Full TypeScript DB types
│
├── backend/                     # FastAPI Python
│   └── app/
│       ├── routers/             # chat, documents, research,
│       │                        # drafting, graph, health
│       ├── services/            # RAG chain, vector store,
│       │                        # LLM router, document OCR
│       ├── models/schemas.py    # Pydantic models
│       └── core/                # Config, Supabase client
│
├── scripts/
│   └── seed_legal_data.py       # Seeds 20 judgments + 15 sections
│
├── docs/
│   ├── supabase-schema.sql      # Full DB schema + RLS
│   └── WEEK*_GUIDE.md           # Build guides
│
└── .github/workflows/ci.yml     # GitHub Actions CI
```

---

## Roadmap

- [x] Week 1 — Monorepo, Supabase schema, auth, role dashboards
- [x] Week 2 — Animated sidebar, chat UI, Hindi toggle, research page
- [x] Week 3 — RAG pipeline, LLM routing, SSE streaming, 20 judgments seeded
- [x] Week 4 — PDF upload, PyMuPDF OCR, AI document analysis
- [x] Week 5 — Draft generator (7 types), citation graph (D3 canvas)
- [x] Week 6 — UI polish, toast system, skeleton loaders, landing page
- [ ] Phase 2 — Neo4j knowledge graph, predictive case analytics
- [ ] Phase 2 — Mobile app (React Native)
- [ ] Phase 2 — Evidence chain management
- [ ] Phase 3 — Court integration APIs, e-filing support
- [ ] Phase 3 — Enterprise SaaS for law firms

---

## Contributing

PRs welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

## Disclaimer

NyayaAI provides **legal information**, not legal advice. Always consult a qualified advocate for serious legal matters. AI-generated documents should be reviewed by a professional before submission.

---

## License

MIT © 2024 NyayaAI

---

<div align="center">
Built with ❤️ for India's 1.4 billion people.<br/>
<sub>Inspired by the Sanskrit word न्याय (Nyāya) — meaning justice, logical reasoning.</sub>
</div>
