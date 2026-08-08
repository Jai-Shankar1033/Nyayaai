from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import chat, documents, research, drafting, health
from app.routers import graph
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"NyayaAI backend starting — env: {settings.ENV}")
    yield
    print("NyayaAI backend shutting down")


app = FastAPI(
    title="NyayaAI API",
    description="India's AI Legal Intelligence Platform — Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,    prefix="/health",         tags=["health"])
app.include_router(chat.router,      prefix="/api/chat",       tags=["chat"])
app.include_router(documents.router, prefix="/api/documents",  tags=["documents"])
app.include_router(research.router,  prefix="/api/research",   tags=["research"])
app.include_router(drafting.router,  prefix="/api/drafting",   tags=["drafting"])
app.include_router(graph.router,     prefix="/api/graph",      tags=["graph"])


@app.get("/")
async def root():
    return {"service": "NyayaAI API", "version": "1.0.0", "status": "running"}
