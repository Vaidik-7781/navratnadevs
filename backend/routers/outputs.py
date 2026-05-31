"""
Outputs Router — Get everything generated for a session.
Files, messages, sprint cards, conflicts, votes, builder DNA.
"""

from fastapi import APIRouter, HTTPException
from services.supabase_service import (
    get_session, get_session_messages, get_session_files,
    get_session_sprint_cards
)

router = APIRouter(prefix="/outputs", tags=["outputs"])


@router.get("/{session_id}/messages")
async def get_messages(session_id: str):
    """All agent messages for a session, ordered by sequence."""
    messages = await get_session_messages(session_id)
    return {"messages": messages, "count": len(messages)}


@router.get("/{session_id}/files")
async def get_files(session_id: str):
    """All generated files for a session."""
    files = await get_session_files(session_id)

    # Build file tree structure
    tree = build_file_tree(files)

    return {
        "files": files,
        "count": len(files),
        "tree": tree,
    }


@router.get("/{session_id}/sprint")
async def get_sprint_board(session_id: str):
    """Sprint board cards grouped by status."""
    cards = await get_session_sprint_cards(session_id)

    board = {
        "todo": [c for c in cards if c["status"] == "todo"],
        "in_progress": [c for c in cards if c["status"] == "in_progress"],
        "review": [c for c in cards if c["status"] == "review"],
        "done": [c for c in cards if c["status"] == "done"],
    }

    return board


@router.get("/{session_id}/full")
async def get_full_output(session_id: str):
    """Everything — one call to get complete session output."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await get_session_messages(session_id)
    files = await get_session_files(session_id)
    sprint_cards = await get_session_sprint_cards(session_id)

    return {
        "session": session,
        "messages": messages,
        "files": files,
        "sprint_cards": sprint_cards,
        "metrics": {
            "total_messages": len(messages),
            "total_files": len(files),
            "total_cards": len(sprint_cards),
            "done_cards": len([c for c in sprint_cards if c["status"] == "done"]),
        }
    }


def build_file_tree(files: list) -> dict:
    """Build nested file tree from flat file list."""
    tree = {}
    for f in files:
        parts = f["filepath"].split("/")
        node = tree
        for part in parts[:-1]:
            if part not in node:
                node[part] = {"type": "folder", "children": {}}
            node = node[part]["children"]
        node[parts[-1]] = {
            "type": "file",
            "filename": f["filename"],
            "language": f.get("language", ""),
            "agent": f.get("agent_name", ""),
            "id": f["id"],
        }
    return tree
