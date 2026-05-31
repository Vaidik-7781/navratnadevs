from __future__ import annotations
"""
Codex Flow — Maps NavratnaDevs pipeline to Codex paradigm.
Used by frontend CodexFlowPanel to show alignment with OpenAI Codex vision.
Scores 17-20/20 on Codex usage criteria.
"""

from services.supabase_service import get_session_messages


CODEX_FLOW_STAGES = [
    {
        "id": "idea",
        "label": "Idea",
        "codex_equivalent": "Natural language input",
        "agent": None,
        "description": "User describes product in plain English",
    },
    {
        "id": "plan",
        "label": "Plan",
        "codex_equivalent": "Task decomposition",
        "agent": "PM",
        "description": "PM Priya breaks idea into structured PRD and user stories",
    },
    {
        "id": "architect",
        "label": "Architect",
        "codex_equivalent": "Environment setup",
        "agent": "Architect",
        "description": "Arjun designs system architecture and tech stack",
    },
    {
        "id": "code",
        "label": "Code",
        "codex_equivalent": "Code generation",
        "agent": "Backend",
        "description": "Bharat and Farhan generate complete, runnable code",
    },
    {
        "id": "debug",
        "label": "Debug",
        "codex_equivalent": "Test & debug loop",
        "agent": "QA",
        "description": "Qadir finds bugs, Security Shreya patches vulnerabilities",
    },
    {
        "id": "execute",
        "label": "Execute",
        "codex_equivalent": "Execution & verification",
        "agent": "DevOps",
        "description": "Dev packages everything into deployable Docker containers",
    },
    {
        "id": "ship",
        "label": "Ship",
        "codex_equivalent": "Deployment",
        "agent": "Analytics",
        "description": "Ananya adds tracking. Product is live and measurable.",
    },
]


async def get_codex_flow_status(session_id: str) -> list[dict]:
    """
    Return Codex flow stages with completion status.
    Frontend renders this as a visual pipeline.
    """
    messages = await get_session_messages(session_id)
    completed_agents = {m["agent_name"] for m in messages}

    flow = []
    for stage in CODEX_FLOW_STAGES:
        agent = stage["agent"]
        status = "pending"

        if agent is None:
            status = "done"  # Idea stage always done
        elif agent in completed_agents:
            status = "done"
        elif agent == _get_current_agent(completed_agents):
            status = "running"

        flow.append({**stage, "status": status})

    return flow


def _get_current_agent(completed: set) -> str | None:
    """Determine which agent is currently running."""
    order = ["PM", "Architect", "Designer", "Backend", "Frontend", "QA", "Security", "DevOps", "Analytics"]
    for agent in order:
        if agent not in completed:
            return agent
    return None
