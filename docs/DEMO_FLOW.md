# NyayaAI — Demo Flow (60 seconds)

This is the exact sequence to use in every demo, interview, or hackathon presentation.

## Setup before demo
1. Both servers running (`npm run dev` + `uvicorn`)
2. One test account created (citizen + lawyer)
3. Browser at `http://localhost:3000`
4. Dark mode ON — looks more impressive

---

## The 60-second demo

### Act 1 — The citizen problem (15 sec)
> "India has 5 crore pending cases. Most citizens get a legal notice and have no idea what it means."

1. Open http://localhost:3000 — show the landing page
2. Click **"I need legal help"**
3. Sign in as citizen

### Act 2 — AI chat in Hindi (20 sec)
> "NyayaAI answers in Hindi with citations from real Supreme Court judgments."

1. Go to **Legal chat**
2. Toggle language to **हिं** (Hindi)
3. Click the suggestion: **"अगर मुझे गिरफ्तार किया जाए तो मेरे क्या अधिकार हैं?"**
4. Show streaming response with citation pills (D.K. Basu, CrPC §41)
5. Point out: *"Cited real judgments — not hallucinated"*

### Act 3 — Document analysis (15 sec)
> "They can upload any FIR or legal notice and get a plain-language breakdown."

1. Go to **Documents**
2. Upload any sample PDF (a simple legal notice)
3. Show the analysis card: document type, urgency badge, parties, action required

### Act 4 — Lawyer tools (10 sec)
> "And for lawyers — semantic research and the citation graph."

1. Switch to lawyer account
2. Go to **Citation graph**
3. Show the animated force graph — drag a node
4. Point out: *"This shows how 20 Supreme Court judgments cite each other"*

---

## One-liner answers for Q&A

**"How is this different from ChatGPT?"**
> RAG — it retrieves from real Indian legal corpus first, then generates. It cannot make up judgments.

**"What happens when the AI is wrong?"**
> Every response shows the source judgment. Users can verify. We never claim it's legal advice.

**"Why Ollama instead of OpenAI?"**
> Privacy and cost. Legal data is sensitive. Local model means zero data leaves the user's machine.

**"Can this scale?"**
> Supabase handles auth + DB + storage. FastAPI is stateless. ChromaDB can hold millions of chunks. Yes.

**"What's next?"**
> Neo4j knowledge graph, mobile app, court filing integration, enterprise SaaS.
