"""
Builder DNA — Post-build summary for Outskill brand alignment.
Shows what the user "learned" and generates shareable content.
"""

from services.supabase_service import get_session_files, get_session_messages
from services.groq_service import call_agent
from prompts.base_prompt import CODEX_BASE
import secrets


async def generate_builder_dna(session_id: str, idea: str, context: dict) -> dict:
    """Generate complete Builder DNA after pipeline completes."""

    files = await get_session_files(session_id)
    messages = await get_session_messages(session_id)

    # Calculate stats
    total_files = len(files)
    languages = list(set(f.get("language", "") for f in files if f.get("language")))
    agents_used = len([k for k in context.keys() if not k.startswith("CONFLICT")])

    # Count bugs and security issues from QA and Security outputs
    bugs_found = 0
    security_issues = 0
    conflicts_resolved = len([k for k in context.keys() if k.startswith("CONFLICT")])

    if "QA" in context:
        qa_text = context["QA"].lower()
        bugs_found = qa_text.count("bug") + qa_text.count("## ") - 1

    if "Security" in context:
        sec_text = context["Security"].lower()
        security_issues = sec_text.count("vulnerability") + sec_text.count("issue")

    # Estimate time saved (rough calculation)
    time_saved_weeks = round(total_files * 0.3 + agents_used * 0.5, 1)
    time_saved_weeks = max(1.5, min(time_saved_weeks, 8.0))

    # Skills demonstrated
    skills = []
    if "Architect" in context:
        skills.extend(["System Design", "API Architecture", "Database Design"])
    if "Security" in context:
        skills.append("Security Engineering")
    if "QA" in context:
        skills.append("Test Strategy")
    if "DevOps" in context:
        skills.extend(["DevOps", "CI/CD"])
    if "Analytics" in context:
        skills.append("Product Analytics")

    # Builder level based on complexity
    if agents_used >= 9 and total_files >= 5:
        builder_level = "Senior Engineer"
    elif agents_used >= 6:
        builder_level = "Mid-Level Engineer"
    else:
        builder_level = "Junior Engineer"

    # Generate shareable content
    share_token = secrets.token_urlsafe(12)

    linkedin_post = await _generate_linkedin_post(idea, total_files, time_saved_weeks, context)
    twitter_thread = await _generate_twitter_thread(idea, total_files, time_saved_weeks)

    return {
        "skills_demonstrated": skills,
        "technologies_used": languages,
        "time_saved_weeks": time_saved_weeks,
        "builder_level": builder_level,
        "total_files_generated": total_files,
        "total_agents_used": agents_used,
        "conflicts_resolved": conflicts_resolved,
        "bugs_found": max(0, bugs_found),
        "security_issues_fixed": max(0, security_issues),
        "linkedin_post": linkedin_post,
        "twitter_thread": twitter_thread,
        "share_token": share_token,
    }


async def _generate_linkedin_post(idea: str, files: int, weeks_saved: float, context: dict) -> str:
    post, _, _ = await call_agent(
        system_prompt=f"""{CODEX_BASE}
You write viral LinkedIn posts for developers. 
Write a compelling post about shipping a product with AI.
Sound authentic, not corporate. First person. 2-3 short paragraphs. End with hashtags.""",
        user_message=f"""
Product idea: {idea}
Files generated: {files}
Time saved: {weeks_saved} weeks

Write a LinkedIn post about using NavratnaDevs (an AI software team) to build this.
Mention specific technical details from the build. Sound like a real developer sharing their experience.
Include: #AIBuilders #OpenAI #NavratnaDevs #BuildInPublic""",
        temperature=0.9,
        max_tokens=300,
    )
    return post


async def _generate_twitter_thread(idea: str, files: int, weeks_saved: float) -> str:
    thread, _, _ = await call_agent(
        system_prompt=f"""{CODEX_BASE}
You write viral Twitter/X threads for developers.
Write a 5-tweet thread. Each tweet separated by ---
Sound like a real developer. Include numbers and specifics.""",
        user_message=f"""
Product idea: {idea}
Files generated: {files}
Time saved: {weeks_saved} weeks

Write a 5-tweet thread about building this product with an AI team (NavratnaDevs).
Tweet 1: Hook
Tweet 2: The problem
Tweet 3: How NavratnaDevs helped
Tweet 4: What was built
Tweet 5: CTA + link

Separate each tweet with ---""",
        temperature=0.9,
        max_tokens=400,
    )
    return thread
