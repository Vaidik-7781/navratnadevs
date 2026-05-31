"""
Agents Router — Query agent outputs, status, and metrics per session.
"""

from fastapi import APIRouter, HTTPException
from services.supabase_service import get_session_messages, get_session

router = APIRouter(prefix="/agents", tags=["agents"])

AGENT_METADATA = {
    "PM":        {"emoji": "🧠", "name": "Priya",  "role": "Product Manager"},
    "Architect": {"emoji": "🏗️", "name": "Arjun",  "role": "Software Architect"},
    "Designer":  {"emoji": "🎨", "name": "Disha",  "role": "UI/UX Designer"},
    "Backend":   {"emoji": "⚙️", "name": "Bharat", "role": "Backend Developer"},
    "Frontend":  {"emoji": "🖥️", "name": "Farhan", "role": "Frontend Developer"},
    "QA":        {"emoji": "🔍", "name": "Qadir",  "role": "QA Engineer"},
    "Security":  {"emoji": "🔐", "name": "Shreya", "role": "Security Engineer"},
    "DevOps":    {"emoji": "📈", "name": "Dev",    "role": "DevOps Engineer"},
    "Analytics": {"emoji": "📊", "name": "Ananya", "role": "Analytics Engineer"},
}


@router.get("/roster")
async def get_agent_roster():
    """Return all 9 agents with metadata. Used by frontend sidebar."""
    return {"agents": AGENT_METADATA}


@router.get("/{session_id}/status")
async def get_agent_statuses(session_id: str):
    """
    Return status of each agent for a session.
    idle | running | done — used for sidebar status indicators.
    """
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await get_session_messages(session_id)
    completed_agents = {m["agent_name"] for m in messages}

    statuses = {}
    for agent_name, meta in AGENT_METADATA.items():
        statuses[agent_name] = {
            **meta,
            "status": "done" if agent_name in completed_agents else "idle",
            "output_count": sum(1 for m in messages if m["agent_name"] == agent_name),
        }

    return {"session_id": session_id, "statuses": statuses}


@router.get("/{session_id}/{agent_name}")
async def get_agent_output(session_id: str, agent_name: str):
    """Get a specific agent's full output for a session."""
    if agent_name not in AGENT_METADATA:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")

    messages = await get_session_messages(session_id)
    agent_messages = [m for m in messages if m["agent_name"] == agent_name]

    if not agent_messages:
        raise HTTPException(status_code=404, detail=f"{agent_name} hasn't spoken yet")

    return {
        "agent": AGENT_METADATA[agent_name],
        "messages": agent_messages,
    }
