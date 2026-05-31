"""
Supabase Service — All database operations for NavratnaDevs.
Uses sync Supabase client wrapped in asyncio executor to avoid blocking.
"""

import os
import asyncio
from functools import partial
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"],
)

def _run(func, *args, **kwargs):
    """Run a sync supabase call in the default thread executor."""
    loop = asyncio.get_event_loop()
    return loop.run_in_executor(None, partial(func, *args, **kwargs))


# ─── SESSIONS ─────────────────────────────────────────────────────────────────

async def create_session(idea: str, solo_founder_mode: bool, user_id: str = None) -> dict:
    data = {"idea": idea, "solo_founder_mode": solo_founder_mode, "status": "idle"}
    if user_id:
        data["user_id"] = user_id
    result = await _run(lambda: supabase.table("sessions").insert(data).execute())
    return result.data[0]


async def update_session_status(session_id: str, status: str, extra: dict = None):
    data = {"status": status, "updated_at": datetime.utcnow().isoformat()}
    if extra:
        data.update(extra)
    await _run(lambda: supabase.table("sessions").update(data).eq("id", session_id).execute())


async def get_session(session_id: str) -> dict:
    result = await _run(lambda: supabase.table("sessions").select("*").eq("id", session_id).single().execute())
    return result.data


async def get_user_sessions(user_id: str) -> list:
    result = await _run(lambda: supabase.table("sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute())
    return result.data


# ─── AGENT OUTPUTS ────────────────────────────────────────────────────────────

async def save_agent_output(
    session_id: str, agent_name: str, agent_emoji: str,
    message: str, output_type: str, mood: str,
    sequence_order: int, metadata: dict = None
) -> dict:
    data = {
        "session_id": session_id, "agent_name": agent_name,
        "agent_emoji": agent_emoji, "message": message,
        "output_type": output_type, "mood": mood,
        "sequence_order": sequence_order, "metadata": metadata or {},
    }
    result = await _run(lambda: supabase.table("agent_outputs").insert(data).execute())
    return result.data[0]


async def get_session_messages(session_id: str) -> list:
    result = await _run(lambda: supabase.table("agent_outputs").select("*").eq("session_id", session_id).order("sequence_order").execute())
    return result.data


# ─── GENERATED FILES ──────────────────────────────────────────────────────────

async def save_generated_file(
    session_id: str, filename: str, filepath: str,
    content: str, language: str, agent_name: str, file_type: str
) -> dict:
    data = {
        "session_id": session_id, "filename": filename, "filepath": filepath,
        "content": content, "language": language,
        "agent_name": agent_name, "file_type": file_type,
    }
    result = await _run(lambda: supabase.table("generated_files").insert(data).execute())
    return result.data[0]


async def get_session_files(session_id: str) -> list:
    result = await _run(lambda: supabase.table("generated_files").select("*").eq("session_id", session_id).execute())
    return result.data


# ─── SPRINT CARDS ─────────────────────────────────────────────────────────────

async def save_sprint_card(
    session_id: str, title: str, description: str,
    agent_owner: str, priority: str = "medium"
) -> dict:
    data = {
        "session_id": session_id, "title": title, "description": description,
        "status": "todo", "agent_owner": agent_owner, "priority": priority,
    }
    result = await _run(lambda: supabase.table("sprint_cards").insert(data).execute())
    return result.data[0]


async def update_sprint_card_status(card_id: str, status: str):
    await _run(lambda: supabase.table("sprint_cards").update({
        "status": status, "updated_at": datetime.utcnow().isoformat()
    }).eq("id", card_id).execute())


async def get_session_sprint_cards(session_id: str) -> list:
    result = await _run(lambda: supabase.table("sprint_cards").select("*").eq("session_id", session_id).order("created_at").execute())
    return result.data


# ─── VOTES ────────────────────────────────────────────────────────────────────

async def save_vote(session_id: str, question: str, agent_name: str, vote: str, reasoning: str) -> dict:
    data = {"session_id": session_id, "question": question, "agent_name": agent_name, "vote": vote, "reasoning": reasoning}
    result = await _run(lambda: supabase.table("votes").insert(data).execute())
    return result.data[0]


# ─── CONFLICTS ────────────────────────────────────────────────────────────────

async def save_conflict(
    session_id: str, agent_a: str, agent_b: str,
    topic: str, agent_a_argument: str, agent_b_argument: str
) -> dict:
    data = {
        "session_id": session_id, "agent_a": agent_a, "agent_b": agent_b,
        "topic": topic, "agent_a_argument": agent_a_argument, "agent_b_argument": agent_b_argument,
    }
    result = await _run(lambda: supabase.table("conflicts").insert(data).execute())
    return result.data[0]


async def resolve_conflict(conflict_id: str, resolution: str, winner: str, votes_for_a: int, votes_for_b: int):
    await _run(lambda: supabase.table("conflicts").update({
        "resolution": resolution, "winner": winner,
        "votes_for_a": votes_for_a, "votes_for_b": votes_for_b,
    }).eq("id", conflict_id).execute())


# ─── MOODS ────────────────────────────────────────────────────────────────────

async def save_mood(session_id: str, agent_name: str, mood_emoji: str, mood_reason: str = None) -> dict:
    data = {"session_id": session_id, "agent_name": agent_name, "mood_emoji": mood_emoji, "mood_reason": mood_reason}
    result = await _run(lambda: supabase.table("moods").insert(data).execute())
    return result.data[0]


# ─── SHARES ───────────────────────────────────────────────────────────────────

async def create_share(session_id: str, share_token: str, linkedin_post: str, twitter_thread: str) -> dict:
    data = {
        "session_id": session_id, "share_token": share_token,
        "linkedin_post": linkedin_post, "twitter_thread": twitter_thread, "is_public": True,
    }
    result = await _run(lambda: supabase.table("shares").insert(data).execute())
    return result.data[0]


async def get_share_by_token(token: str) -> dict:
    result = await _run(lambda: supabase.table("shares").select("*, sessions(*)").eq("share_token", token).single().execute())
    # Increment view count safely
    try:
        current = result.data.get("view_count", 0) or 0
        await _run(lambda: supabase.table("shares").update(
            {"view_count": current + 1}
        ).eq("share_token", token).execute())
    except Exception:
        pass  # Non-critical, never fail a read due to counter update
    return result.data
