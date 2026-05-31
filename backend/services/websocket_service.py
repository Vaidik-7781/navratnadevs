"""
WebSocket Service — Real-time push to frontend
Every agent message, mood update, sprint card move streams live.
"""

import json
import asyncio
from datetime import datetime
from typing import Dict
from fastapi import WebSocket


# ─── CONNECTION MANAGER ───────────────────────────────────────────────────────

class ConnectionManager:
    """
    Manages WebSocket connections per session.
    Multiple browser tabs can connect to same session.
    """

    def __init__(self):
        # session_id → list of WebSocket connections
        self.active_connections: Dict[str, list] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def send_to_session(self, session_id: str, event_type: str, data: dict):
        """Send event to ALL connections for a session."""
        if session_id not in self.active_connections:
            return

        message = json.dumps({
            "type": event_type,
            "data": data,
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
        })

        dead_connections = []
        for ws in self.active_connections[session_id]:
            try:
                await ws.send_text(message)
            except Exception:
                dead_connections.append(ws)

        for ws in dead_connections:
            self.active_connections[session_id].remove(ws)

    async def stream_token(self, session_id: str, agent_name: str, token: str):
        """Stream individual token from agent response."""
        await self.send_to_session(session_id, "agent_token", {
            "agent_name": agent_name,
            "token": token,
        })

    async def send_agent_message(self, session_id: str, message_data: dict):
        """Full agent message complete."""
        await self.send_to_session(session_id, "agent_message", message_data)

    async def send_mood_update(self, session_id: str, agent_name: str, mood: str, reason: str):
        await self.send_to_session(session_id, "mood_update", {
            "agent_name": agent_name,
            "mood": mood,
            "reason": reason,
        })

    async def send_sprint_update(self, session_id: str, card: dict):
        await self.send_to_session(session_id, "sprint_update", card)

    async def send_conflict_start(self, session_id: str, conflict: dict):
        await self.send_to_session(session_id, "conflict_start", conflict)

    async def send_conflict_resolved(self, session_id: str, resolution: dict):
        await self.send_to_session(session_id, "conflict_resolved", resolution)

    async def send_vote_update(self, session_id: str, vote_data: dict):
        await self.send_to_session(session_id, "vote_update", vote_data)

    async def send_file_generated(self, session_id: str, file_data: dict):
        await self.send_to_session(session_id, "file_generated", {
            "filename": file_data.get("filename"),
            "filepath": file_data.get("filepath"),
            "language": file_data.get("language"),
            "agent_name": file_data.get("agent_name"),
        })

    async def send_api_call_log(
        self,
        session_id: str,
        agent_name: str,
        status: str,
        duration_ms: int = None,
        tokens: int = None
    ):
        """For API Call Inspector panel in frontend."""
        await self.send_to_session(session_id, "api_call_log", {
            "agent_name": agent_name,
            "model": "groq/llama-3.3-70b-versatile",
            "status": status,
            "duration_ms": duration_ms,
            "tokens_used": tokens,
        })

    async def send_pipeline_complete(self, session_id: str, summary: dict):
        await self.send_to_session(session_id, "pipeline_complete", summary)

    async def send_pipeline_error(self, session_id: str, error: str):
        await self.send_to_session(session_id, "pipeline_error", {"error": error})

    def get_connection_count(self, session_id: str) -> int:
        return len(self.active_connections.get(session_id, []))


# ─── SINGLETON ────────────────────────────────────────────────────────────────
# Shared across entire app
manager = ConnectionManager()
