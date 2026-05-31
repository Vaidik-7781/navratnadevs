from __future__ import annotations
"""
Voting Engine — Agents vote on architecture and technical decisions.
Used by conflict_resolver and can be triggered independently.
"""

from services.groq_service import call_agent
from services.supabase_service import save_vote
from services.websocket_service import manager
from prompts.base_prompt import CODEX_BASE


VOTING_AGENTS = ["PM", "QA", "DevOps", "Analytics", "Designer"]


async def run_vote(
    session_id: str,
    question: str,
    option_a: str,
    option_b: str,
    context: dict,
    exclude_agents: list[str] = None,
) -> dict:
    """
    Run a vote among neutral agents.
    Returns vote tally and winner.
    """
    exclude = exclude_agents or []
    voters = [a for a in VOTING_AGENTS if a not in exclude]

    votes_a = 0
    votes_b = 0
    vote_records = []

    for voter in voters:
        voter_context = context.get(voter, "You have general software engineering knowledge.")

        response, _, _ = await call_agent(
            system_prompt=f"""{CODEX_BASE}
You are {voter} at NavratnaDevs casting a technical vote.
Be decisive. Pick the stronger option. Give one-sentence reasoning.""",
            user_message=f"""
VOTE QUESTION: {question}

Option A: {option_a}
Option B: {option_b}

Your context: {voter_context[:300]}

Reply EXACTLY in this format:
VOTE: A or VOTE: B
REASON: [one sentence]""",
            temperature=0.7,
            max_tokens=80,
        )

        vote = "A" if "VOTE: A" in response.upper() else "B"
        reason = ""
        if "REASON:" in response:
            reason = response.split("REASON:")[-1].strip()

        if vote == "A":
            votes_a += 1
        else:
            votes_b += 1

        record = {
            "voter": voter,
            "vote": vote,
            "option": option_a if vote == "A" else option_b,
            "reason": reason,
        }
        vote_records.append(record)

        await save_vote(session_id, question, voter, "yes" if vote == "A" else "no", reason)
        await manager.send_vote_update(session_id, {
            "voter": voter,
            "vote": vote,
            "votes_a": votes_a,
            "votes_b": votes_b,
            "option_a": option_a,
            "option_b": option_b,
        })

    winner_option = option_a if votes_a >= votes_b else option_b
    winner_label = "A" if votes_a >= votes_b else "B"

    return {
        "question": question,
        "option_a": option_a,
        "option_b": option_b,
        "votes_a": votes_a,
        "votes_b": votes_b,
        "winner": winner_option,
        "winner_label": winner_label,
        "vote_records": vote_records,
    }
