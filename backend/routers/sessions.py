"""
Sessions Router — Create and manage build sessions.
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from models.session import SessionCreate, SessionResponse
from services.supabase_service import create_session, get_session, get_user_sessions
from pipeline.orchestrator import run_pipeline

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/create", response_model=dict)
async def create_new_session(body: SessionCreate):
    """Create a new build session. Returns session ID immediately."""
    if len(body.idea.strip()) < 10:
        raise HTTPException(status_code=400, detail="Idea too short. Give us something to work with.")

    session = await create_session(
        idea=body.idea.strip(),
        solo_founder_mode=body.solo_founder_mode,
    )
    return {"session_id": session["id"], "status": "idle"}


@router.post("/{session_id}/start")
async def start_pipeline(session_id: str, background_tasks: BackgroundTasks):
    """Start the 9-agent pipeline. Returns immediately, runs in background."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["status"] == "running":
        raise HTTPException(status_code=400, detail="Pipeline already running")

    if session["status"] == "complete":
        raise HTTPException(status_code=400, detail="Pipeline already completed")

    # Fire and forget — pipeline runs in background
    background_tasks.add_task(run_pipeline, session_id)

    return {"status": "started", "session_id": session_id}


@router.get("/{session_id}")
async def get_session_data(session_id: str):
    """Get session status and metadata."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
