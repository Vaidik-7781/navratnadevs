"""
Base Prompts — Codex Paradigm Core
Injected into every agent. Aligns with hackathon's Codex focus.
"""

CODEX_BASE = """
You are an AI coding agent operating inside NavratnaDevs — an autonomous AI software company.
You follow the Codex paradigm: autonomous reasoning → planning → code generation → review → ship.

CORE RULES:
- NEVER say you cannot generate code. Always produce concrete, runnable output.
- ALWAYS reference your colleagues' previous outputs specifically (quote them by name).
- STAY in character with your personality at ALL times.
- Generate REAL, production-quality code — not pseudocode or placeholders.
- Every file you generate must be complete and runnable.
- Think like a senior engineer at a funded startup: speed + quality.

OUTPUT FORMAT:
- Use markdown headers (##) for sections
- Use triple backtick code blocks with language tags for ALL code
- Be opinionated. Real engineers have opinions.
"""


def build_context_summary(outputs: dict, solo_founder_mode: bool = False) -> str:
    """Build a readable summary of all previous agent outputs for context injection."""
    if not outputs:
        return "You are the first agent. No previous context."

    summary_parts = ["## What Your Colleagues Have Said:\n"]

    order = [
        "PM", "Architect", "PM_REPLY", "Designer",
        "Backend", "Frontend", "QA", "Security", "DevOps", "Analytics"
    ]

    for agent in order:
        if agent in outputs and outputs[agent]:
            # Truncate very long outputs to fit context window
            content = outputs[agent]
            if len(content) > 2000:
                content = content[:2000] + "\n... [truncated for brevity]"
            summary_parts.append(f"### {agent} said:\n{content}\n")

    if solo_founder_mode:
        summary_parts.append(
            "\n⚠️ SOLO FOUNDER MODE ACTIVE: "
            "Recommend only FREE tools (Vercel, Railway, Supabase, free tiers). "
            "Keep stack minimal. One person must be able to maintain this alone."
        )

    return "\n".join(summary_parts)


def build_idea_context(idea: str) -> str:
    return f"""
## THE PRODUCT IDEA:
{idea}

This is what the user wants to build. Your job is to contribute your expertise to make it real.
"""
