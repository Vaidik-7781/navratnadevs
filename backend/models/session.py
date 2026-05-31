from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, Literal, Any
from datetime import datetime
from uuid import UUID


# ─── SESSION MODELS ───────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    idea: str = Field(..., min_length=10, max_length=2000)
    solo_founder_mode: bool = False

class SessionResponse(BaseModel):
    id: str
    idea: str
    status: Literal['idle', 'running', 'complete', 'failed']
    solo_founder_mode: bool
    total_time_seconds: Optional[int]
    estimated_manual_weeks: Optional[float]
    builder_level: Optional[str]
    created_at: str

class SessionStart(BaseModel):
    session_id: str


# ─── AGENT OUTPUT MODELS ──────────────────────────────────────────────────────

class AgentMessage(BaseModel):
    agent_name: str
    agent_emoji: str
    message: str
    output_type: Literal[
        'prd','architecture','design','code',
        'bug','security','devops','analytics',
        'debate','vote','conflict','resolution'
    ]
    mood: str = '💼'
    sequence_order: int
    metadata: dict = {}
    created_at: str

class AgentOutputResponse(BaseModel):
    id: str
    session_id: str
    agent_name: str
    agent_emoji: str
    message: str
    output_type: str
    mood: str
    sequence_order: int
    metadata: dict
    created_at: str


# ─── GENERATED FILE MODELS ────────────────────────────────────────────────────

class GeneratedFile(BaseModel):
    id: Optional[str] = None
    session_id: str
    filename: str
    filepath: str
    content: str
    language: str
    agent_name: str
    file_type: Literal['frontend','backend','database','config','docs','test','devops']

class FileTreeNode(BaseModel):
    name: str
    path: str
    type: Literal['file', 'folder']
    language: Optional[str] = None
    children: Optional[list['FileTreeNode']] = None


# ─── VOTE MODELS ──────────────────────────────────────────────────────────────

class VoteCreate(BaseModel):
    session_id: str
    question: str
    agent_name: str
    vote: Literal['yes', 'no', 'abstain']
    reasoning: str

class VoteResponse(BaseModel):
    question: str
    results: dict[str, int]  # yes: 5, no: 2, abstain: 1
    winner: str
    votes: list[VoteCreate]


# ─── CONFLICT MODELS ──────────────────────────────────────────────────────────

class ConflictCreate(BaseModel):
    session_id: str
    agent_a: str
    agent_b: str
    topic: str
    agent_a_argument: str
    agent_b_argument: str

class ConflictResponse(BaseModel):
    id: str
    agent_a: str
    agent_b: str
    topic: str
    agent_a_argument: str
    agent_b_argument: str
    resolution: Optional[str]
    winner: Optional[str]
    votes_for_a: int
    votes_for_b: int


# ─── SPRINT CARD MODELS ───────────────────────────────────────────────────────

class SprintCardCreate(BaseModel):
    session_id: str
    title: str
    description: Optional[str] = None
    status: Literal['todo','in_progress','review','done'] = 'todo'
    agent_owner: str
    priority: Literal['low','medium','high','critical'] = 'medium'

class SprintCardUpdate(BaseModel):
    status: Literal['todo','in_progress','review','done']

class SprintCardResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    agent_owner: str
    priority: str


# ─── MOOD MODELS ──────────────────────────────────────────────────────────────

class MoodUpdate(BaseModel):
    session_id: str
    agent_name: str
    mood_emoji: str
    mood_reason: Optional[str] = None


# ─── SHARE MODELS ─────────────────────────────────────────────────────────────

class ShareCreate(BaseModel):
    session_id: str

class ShareResponse(BaseModel):
    share_token: str
    share_url: str
    linkedin_post: str
    twitter_thread: str


# ─── WEBSOCKET EVENT MODELS ───────────────────────────────────────────────────

class WSEvent(BaseModel):
    type: Literal[
        'agent_message',
        'mood_update',
        'sprint_update',
        'conflict_start',
        'conflict_resolved',
        'vote_update',
        'file_generated',
        'pipeline_complete',
        'pipeline_error',
        'api_call_log'
    ]
    data: Any
    session_id: str
    timestamp: str


# ─── API CALL LOG (for inspector panel) ──────────────────────────────────────

class APICallLog(BaseModel):
    agent_name: str
    model: str
    status: Literal['queued', 'calling', 'done', 'error']
    duration_ms: Optional[int] = None
    tokens_used: Optional[int] = None


# ─── BUILDER DNA ──────────────────────────────────────────────────────────────

class BuilderDNA(BaseModel):
    session_id: str
    skills_demonstrated: list[str]
    technologies_used: list[str]
    time_saved_weeks: float
    builder_level: str
    total_files_generated: int
    total_agents_used: int
    conflicts_resolved: int
    bugs_found: int
    security_issues_fixed: int
    linkedin_post: str
    twitter_thread: str


# ─── FULL SESSION OUTPUT ──────────────────────────────────────────────────────

class FullSessionOutput(BaseModel):
    session: SessionResponse
    messages: list[AgentOutputResponse]
    files: list[GeneratedFile]
    sprint_cards: list[SprintCardResponse]
    conflicts: list[ConflictResponse]
    votes: list[VoteResponse]
    builder_dna: Optional[BuilderDNA]
    metrics: dict
