from pydantic import BaseModel
from typing import Optional, Literal


class Vote(BaseModel):
    id: Optional[str] = None
    session_id: str
    question: str
    agent_name: str
    vote: Literal["yes", "no", "abstain"]
    reasoning: Optional[str] = None
    created_at: Optional[str] = None
