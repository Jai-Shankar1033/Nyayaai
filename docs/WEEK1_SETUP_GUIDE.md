# NyayaAI — Week 1 Complete Setup Guide

## Prerequisites checklist

Before starting, install these on your machine:

- [ ] Node.js 20+ → https://nodejs.org
- [ ] Python 3.12+ → https://python.org
- [ ] Git → https://git-scm.com
- [ ] Ollama → https://ollama.ai (install and run it)
- [ ] VS Code (recommended)

---

## Step 1 — Clone and install

```bash
# Clone your repo (after pushing to GitHub)
git clone https://github.com/YOUR_USERNAME/nyayaai.git
cd nyayaai

# Install frontend dependencies
cd frontend
npm install
cd ..

# Set up Python virtual environment
cd backend
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install Python deps
pip install -r requirements.txt
cd ..
```

---

## Step 2 — Create Supabase project

1. Go to https://supabase.com and create a free account
2. Click **New Project** → name it `nyayaai`
3. Choose a strong database password and save it
4. Wait ~2 minutes for the project to be ready

### Run the database schema

1. In Supabase dashboard → **SQL Editor** → **New query**
2. Open `docs/supabase-schema.sql` from this repo
3. Paste the entire file contents into the editor
4. Click **Run** — you should see "Success"

### Get your API keys

In Supabase dashboard → **Settings** → **API**:

- Copy `Project URL` → this is your `SUPABASE_URL`
- Copy `anon / public` key → this is your `SUPABASE_ANON_KEY`
- Copy `service_role` key → this is your `SUPABASE_SERVICE_KEY` (keep this secret!)

---

## Step 3 — Set up environment variables

```bash
# Frontend
cp frontend/.env.local.example frontend/.env.local
# Open frontend/.env.local and fill in:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Backend
cp backend/.env.example backend/.env
# Open backend/.env and fill in:
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_SERVICE_KEY=eyJhbGci...   (service role key)
# SUPABASE_ANON_KEY=eyJhbGci...
# GEMINI_API_KEY=                     (leave blank initially — Ollama only)
```

---

## Step 4 — Pull Ollama model

```bash
# Make sure Ollama is running (open the Ollama app)
ollama pull llama3

# Test it works
ollama run llama3 "What is IPC Section 302?"
# Press Ctrl+D to exit
```

---

## Step 5 — Seed legal data into ChromaDB

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python ../scripts/seed_legal_data.py
# Should print: ✅ Seeded 6 judgments and 5 legal sections
```

---

## Step 6 — Start both servers

Open **two terminal windows**:

**Terminal 1 — Frontend:**
```bash
cd nyayaai/frontend
npm run dev
# Starts at http://localhost:3000
```

**Terminal 2 — Backend:**
```bash
cd nyayaai/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
# Starts at http://localhost:8000
```

---

## Step 7 — Verify everything works

| Check | URL | Expected |
|-------|-----|----------|
| Frontend home | http://localhost:3000 | Landing page with "न्याय AI" |
| Backend health | http://localhost:8000/health | `{"status": "healthy"}` |
| API docs | http://localhost:8000/docs | Swagger UI with all routes |
| Supabase auth | http://localhost:3000/signup | Sign up form |

---

## Step 8 — Create your first test account

1. Go to http://localhost:3000/signup?role=citizen
2. Enter name, email, password
3. You should be redirected to `/citizen` dashboard

Try also: http://localhost:3000/signup?role=lawyer

---

## File structure at end of Week 1

```
nyayaai/
├── .github/workflows/ci.yml        # GitHub Actions
├── .gitignore
├── README.md
├── package.json                     # Monorepo root
│
├── frontend/                        # Next.js 14
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/        # Login page
│   │   │   ├── (auth)/signup/       # Signup page
│   │   │   ├── (dashboard)/citizen/ # Citizen dashboard
│   │   │   ├── (dashboard)/lawyer/  # Lawyer dashboard
│   │   │   ├── globals.css          # Design tokens
│   │   │   ├── layout.tsx           # Root layout
│   │   │   └── page.tsx             # Landing page
│   │   ├── lib/supabase/            # Supabase clients
│   │   ├── types/database.ts        # Full TypeScript types
│   │   └── middleware.ts            # Auth + route protection
│   └── tailwind.config.ts           # NyayaAI design system
│
├── backend/                         # FastAPI Python
│   ├── app/
│   │   ├── main.py                  # App entry point
│   │   ├── core/config.py           # Settings
│   │   ├── core/supabase.py         # Supabase client
│   │   ├── models/schemas.py        # Pydantic models
│   │   ├── routers/                 # API routes
│   │   │   ├── chat.py              # /api/chat
│   │   │   ├── documents.py         # /api/documents
│   │   │   ├── research.py          # /api/research
│   │   │   └── drafting.py          # /api/drafting
│   │   └── services/                # Business logic
│   │       ├── llm_router.py        # Ollama + Gemini routing
│   │       ├── chat_service.py      # LangChain RAG chat
│   │       ├── document_service.py  # OCR + summarize
│   │       ├── research_service.py  # ChromaDB search
│   │       └── drafting_service.py  # Draft generation
│   ├── data/chroma/                 # Vector DB (auto-created)
│   └── requirements.txt
│
├── docs/
│   ├── supabase-schema.sql          # Complete DB schema + RLS
│   └── WEEK1_SETUP_GUIDE.md        # This file
│
└── scripts/
    └── seed_legal_data.py           # Seeds ChromaDB
```

---

## Common errors and fixes

### "Module not found" in backend
```bash
# Make sure venv is activated
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### Supabase "JWT expired" error
- Check your SUPABASE_ANON_KEY in `.env.local` is the anon key, not service key

### Ollama "connection refused"
```bash
# Make sure Ollama app is open and running
ollama list   # should show llama3
```

### ChromaDB import error
```bash
pip install chromadb sentence-transformers --break-system-packages
```

---

## What's next — Week 2

- Sidebar navigation with Framer Motion
- Role-based route guards
- Chat UI component with typewriter effect
- Language toggle (Hindi / English)
- Dark mode polish
