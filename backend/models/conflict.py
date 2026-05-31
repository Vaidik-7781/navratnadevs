from pydantic import BaseModel
from typing import Optional


class Conflict(BaseModel):
    id: Optional[str] = None
    session_id: str
    agent_a: str
    agent_b: str
    topic: str
    agent_a_argument: Optional[str] = None
    agent_b_argument: Optional[str] = None
    resolution: Optional[str] = None
    winner: Optional[str] = None
    votes_for_a: int = 0
    votes_for_b: int = 0
    created_at: Optional[str] = None
