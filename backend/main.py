"""
NavratnaDevs Backend — Main Entry Point
FastAPI + WebSockets + 9 AI Agents powered by Groq
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.sessions import router as sessions_router
from routers.outputs import router as outputs_router
from routers.share import router as share_router
from routers.agents import router as agents_router
from routers.auth import router as auth_router
from services.websocket_service import manager

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("NavratnaDevs API starting...")
    yield
    # Shutdown
    print("NavratnaDevs API shutting down...")


app = FastAPI(
    title="NavratnaDevs API",
    description="9 AI agents that build your product. Powered by Groq.",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROUTERS ──────────────────────────────────────────────────────────────────

app.include_router(sessions_router, prefix="/api")
app.include_router(outputs_router, prefix="/api")
app.include_router(share_router, prefix="/api")
app.include_router(agents_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

# ─── WEBSOCKET ────────────────────────────────────────────────────────────────

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    Real-time agent updates stream through here.
    Every token, mood update, sprint card, conflict — all live.
    """
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception:
        manager.disconnect(websocket, session_id)


# ─── HEALTH ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "online",
        "service": "NavratnaDevs API",
        "agents": 9,
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    }


@app.get("/")
async def root():
    return {
        "name": "NavratnaDevs",
        "tagline": "Your idea. 9 agents. One product.",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
