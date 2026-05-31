from pydantic import BaseModel
from typing import Optional


class AgentOutput(BaseModel):
    id: Optional[str] = None
    session_id: str
    agent_name: str
    agent_emoji: str
    message: str
    output_type: str
    mood: str = "💼"
    sequence_order: int
    metadata: dict = {}
    created_at: Optional[str] = None
