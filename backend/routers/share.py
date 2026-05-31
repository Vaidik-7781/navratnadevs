"""
Share Router — Generate public shareable links for builds.
Includes auto-generated LinkedIn + Twitter content.
"""

import secrets
from fastapi import APIRouter, HTTPException
from services.supabase_service import (
    get_session, create_share, get_share_by_token,
    get_session_messages, get_session_files
)

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/{session_id}")
async def create_share_link(session_id: str):
    """Generate a public share link for a completed build."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["status"] != "complete":
        raise HTTPException(status_code=400, detail="Build not complete yet")

    share_token = secrets.token_urlsafe(12)

    # Generate social content
    idea = session["idea"]
    files = await get_session_files(session_id)

    linkedin_post = _build_linkedin(idea, len(files))
    twitter_thread = _build_twitter(idea, len(files))

    share = await create_share(
        session_id=session_id,
        share_token=share_token,
        linkedin_post=linkedin_post,
        twitter_thread=twitter_thread,
    )

    return {
        "share_token": share_token,
        "share_url": f"/share/{share_token}",
        "linkedin_post": linkedin_post,
        "twitter_thread": twitter_thread,
    }


@router.get("/{token}")
async def get_shared_build(token: str):
    """Get a publicly shared build by token."""
    share = await get_share_by_token(token)
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")

    return share


def _build_linkedin(idea: str, file_count: int) -> str:
    return f"""🚀 Just shipped: {idea}

Built with NavratnaDevs — an AI software team of 9 specialist agents (PM, Architect, Designer, Backend, Frontend, QA, Security, DevOps, Analytics).

Generated {file_count} files. Zero team meetings. Zero salary bills.

This is what AI-native building looks like in 2025.

#AIBuilders #NavratnaDevs #BuildInPublic #OpenAI #SoloFounder"""


def _build_twitter(idea: str, file_count: int) -> str:
    return f"""Just shipped {idea} with an AI team. Here's how 🧵

---

The old way: hire 9 engineers, spend months planning, spend ₹lakhs.

The new way: NavratnaDevs — 9 AI agents that debate, build, and ship for you.

---

My AI team included: PM, Architect, Designer, Backend dev, Frontend dev, QA engineer, Security engineer, DevOps, and Analytics.

They argued. They voted. They shipped.

---

Generated {file_count} production files in under 15 minutes.

PRD, API routes, React components, tests, Dockerfile, CI/CD — all of it.

---

Solo builders are winning because tools like this exist.

You don't need a team anymore. You need the right AI team.

Try NavratnaDevs → [link]

#AIBuilders #BuildInPublic"""
