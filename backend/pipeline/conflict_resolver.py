from __future__ import annotations
"""
Conflict Resolver — When agents disagree, this triggers a debate.
Visible to user in real time. Other agents vote. Winner's approach proceeds.
"""

from services.groq_service import call_agent
from services.supabase_service import save_conflict, resolve_conflict, save_vote
from services.websocket_service import manager
from prompts.base_prompt import CODEX_BASE


# ─── CONFLICT DETECTION ───────────────────────────────────────────────────────

CONFLICT_SIGNALS = {
    ("PM", "Architect"): ["too complex", "cut", "remove", "overscoped", "too many features"],
    ("Backend", "Frontend"): ["disagree", "api shape", "endpoint", "response format", "wrong approach"],
    ("QA", "Backend"): ["this will break", "untested", "no validation", "missing error handling"],
    ("Security", "Backend"): ["vulnerability", "insecure", "must fix", "blocking", "owasp"],
    ("Security", "Frontend"): ["xss", "exposed", "insecure", "client-side validation only"],
    ("Designer", "Backend"): ["bad api design", "ux impact", "extra call", "unnecessary complexity"],
}

VOTER_AGENTS = ["PM", "QA", "DevOps", "Analytics"]  # neutral-ish agents who vote


async def check_and_resolve_conflict(
    session_id: str,
    agent_name: str,
    output: str,
    context: dict,
    idea: str,
) -> dict | None:
    """
    Check if this agent's output conflicts with any previous agent.
    If conflict detected → trigger visible debate → vote → resolve.
    Returns conflict resolution dict or None.
    """
    output_lower = output.lower()

    for (agent_a, agent_b), signals in CONFLICT_SIGNALS.items():
        # Check if current agent is one of the pair
        if agent_name not in [agent_a, agent_b]:
            continue

        # Check if other agent in pair has already spoken
        other_agent = agent_b if agent_name == agent_a else agent_a
        if other_agent not in context:
            continue

        # Check if conflict signals present in current output
        if any(signal in output_lower for signal in signals):
            # Conflict detected!
            topic = detect_conflict_topic(agent_name, output, signals)

            conflict = await run_conflict_resolution(
                session_id=session_id,
                agent_a=agent_a,
                agent_b=agent_b,
                topic=topic,
                agent_a_output=context.get(agent_a, ""),
                agent_b_output=context.get(agent_b, output),
                context=context,
                idea=idea,
            )
            return conflict

    return None


def detect_conflict_topic(agent_name: str, output: str, signals: list) -> str:
    """Extract what the conflict is specifically about."""
    output_lower = output.lower()
    for signal in signals:
        if signal in output_lower:
            # Find the sentence containing the signal
            sentences = output.split(".")
            for sentence in sentences:
                if signal in sentence.lower():
                    return sentence.strip()[:200]
    return f"Technical disagreement involving {agent_name}"


async def run_conflict_resolution(
    session_id: str,
    agent_a: str,
    agent_b: str,
    topic: str,
    agent_a_output: str,
    agent_b_output: str,
    context: dict,
    idea: str,
) -> dict:
    """
    Full conflict resolution flow:
    1. Notify frontend of conflict
    2. Each agent argues their case
    3. Neutral agents vote
    4. Winner declared
    5. Resolution saved
    """

    # Notify frontend: conflict starting
    await manager.send_conflict_start(session_id, {
        "agent_a": agent_a,
        "agent_b": agent_b,
        "topic": topic,
    })

    # ── AGENT A ARGUMENT ──────────────────────────────────────────────────────
    agent_a_argument, _, _ = await call_agent(
        system_prompt=f"""{CODEX_BASE}
You are {agent_a} in NavratnaDevs. You are in a technical debate with {agent_b}.
State your position CLEARLY and CONCISELY in 3-5 sentences. Be specific. Be confident.""",
        user_message=f"""
Topic of debate: {topic}

Your previous position: {agent_a_output[:500]}
{agent_b}'s challenge: {agent_b_output[:500]}

Defend your position in 3-5 sentences. Be direct.""",
        temperature=0.85,
        max_tokens=400,
    )

    # ── AGENT B ARGUMENT ──────────────────────────────────────────────────────
    agent_b_argument, _, _ = await call_agent(
        system_prompt=f"""{CODEX_BASE}
You are {agent_b} in NavratnaDevs. You are in a technical debate with {agent_a}.
State your position CLEARLY and CONCISELY in 3-5 sentences. Be specific. Be confident.""",
        user_message=f"""
Topic of debate: {topic}

{agent_a}'s position: {agent_a_argument}
Your original position: {agent_b_output[:500]}

Defend your position in 3-5 sentences. Be direct.""",
        temperature=0.85,
        max_tokens=400,
    )

    # Save conflict to DB
    conflict_record = await save_conflict(
        session_id=session_id,
        agent_a=agent_a,
        agent_b=agent_b,
        topic=topic,
        agent_a_argument=agent_a_argument,
        agent_b_argument=agent_b_argument,
    )

    # ── VOTING ────────────────────────────────────────────────────────────────
    votes_for_a = 0
    votes_for_b = 0
    vote_records = []

    for voter in VOTER_AGENTS:
        if voter in [agent_a, agent_b]:
            continue

        vote_response, _, _ = await call_agent(
            system_prompt=f"""{CODEX_BASE}
You are {voter} at NavratnaDevs. You are voting to resolve a technical debate.
Vote for whoever makes the stronger technical argument. Be brief.""",
            user_message=f"""
DEBATE: {topic}

{agent_a} argues: {agent_a_argument}
{agent_b} argues: {agent_b_argument}

Vote: Who is more correct? Reply with ONLY:
VOTE: {agent_a} or VOTE: {agent_b}
REASON: [one sentence]""",
            temperature=0.7,
            max_tokens=100,
        )

        vote = agent_a if agent_a.lower() in vote_response.lower()[:20] else agent_b
        if vote == agent_a:
            votes_for_a += 1
        else:
            votes_for_b += 1

        await save_vote(session_id, topic, voter, "yes" if vote == agent_a else "no", vote_response)
        vote_records.append({"voter": voter, "vote": vote, "response": vote_response})

        await manager.send_vote_update(session_id, {
            "voter": voter,
            "vote": vote,
            "votes_for_a": votes_for_a,
            "votes_for_b": votes_for_b,
        })

    # ── RESOLUTION ────────────────────────────────────────────────────────────
    winner = agent_a if votes_for_a >= votes_for_b else agent_b

    resolution, _, _ = await call_agent(
        system_prompt=f"""{CODEX_BASE}
You are a neutral technical arbiter at NavratnaDevs.
Write a clear, decisive resolution to a technical debate.""",
        user_message=f"""
DEBATE: {topic}
{agent_a} argued: {agent_a_argument}
{agent_b} argued: {agent_b_argument}
VOTE RESULT: {winner} wins ({votes_for_a}-{votes_for_b})

Write the resolution in 2-3 sentences. State clearly what approach will be used going forward.
Start with "{winner}'s approach will be used:".""",
        temperature=0.7,
        max_tokens=200,
    )

    # Save resolution
    await resolve_conflict(
        conflict_id=conflict_record["id"],
        resolution=resolution,
        winner=winner,
        votes_for_a=votes_for_a,
        votes_for_b=votes_for_b,
    )

    resolution_data = {
        "agent_a": agent_a,
        "agent_b": agent_b,
        "topic": topic,
        "agent_a_argument": agent_a_argument,
        "agent_b_argument": agent_b_argument,
        "winner": winner,
        "votes_for_a": votes_for_a,
        "votes_for_b": votes_for_b,
        "resolution": resolution,
        "votes": vote_records,
    }

    await manager.send_conflict_resolved(session_id, resolution_data)

    return resolution_data
