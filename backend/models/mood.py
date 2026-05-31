from pydantic import BaseModel
from typing import Optional


class Mood(BaseModel):
    id: Optional[str] = None
    session_id: str
    agent_name: str
    mood_emoji: str
    mood_reason: Optional[str] = None
    created_at: Optional[str] = None
