"""
Share Service — Generates LinkedIn + Twitter content.
Builds shareable cards for Builder DNA panel.
"""

import secrets
from services.supabase_service import create_share, get_session, get_session_files


async def generate_and_save_share(session_id: str) -> dict:
    """Generate share token + social content for a completed session."""
    session = await get_session(session_id)
    files = await get_session_files(session_id)

    idea = session.get("idea", "")
    file_count = len(files)
    weeks_saved = session.get("estimated_manual_weeks", 3.0)

    token = secrets.token_urlsafe(12)
    linkedin = _linkedin(idea, file_count, weeks_saved)
    twitter = _twitter(idea, file_count)

    share = await create_share(
        session_id=session_id,
        share_token=token,
        linkedin_post=linkedin,
        twitter_thread=twitter,
    )

    return {
        "share_token": token,
        "share_url": f"/share/{token}",
        "linkedin_post": linkedin,
        "twitter_thread": twitter,
    }


def _linkedin(idea: str, files: int, weeks: float) -> str:
    return f"""🚀 Just shipped: {idea}

Used NavratnaDevs — 9 AI agents (PM, Architect, Designer, Backend, Frontend, QA, Security, DevOps, Analytics) — to build this from scratch.

Generated {files} production files. Saved ~{weeks} weeks of manual work.

Solo builders don't need teams anymore. They need the right AI team.

#AIBuilders #NavratnaDevs #BuildInPublic #OpenAI #SoloFounder #Outskill"""


def _twitter(idea: str, files: int) -> str:
    return f"""Just shipped "{idea}" with an AI software team 🧵

1/ The old way: hire engineers, spend months, burn cash.
The new way: NavratnaDevs — 9 specialist AI agents that argue, vote, and ship.

2/ My AI team: PM Priya wrote the PRD. Architect Arjun challenged her. They voted. Frontend Farhan argued with Backend Bharat. QA Qadir found 5 bugs. Security Shreya blocked everything first. DevOps Dev shipped it.

3/ Generated {files} production files. PRD, API routes, React components, tests, Dockerfile, CI/CD — all of it. Real code.

4/ This is what AI-native building looks like. Solo founder = entire software company.

5/ Try NavratnaDevs. Your idea → 9 agents → shipped product. #AIBuilders #BuildInPublic"""
