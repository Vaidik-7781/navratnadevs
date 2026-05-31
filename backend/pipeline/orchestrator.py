"""
Orchestrator — Runs all 9 agents in sequence.
Fixes: file extraction from code blocks, sprint card status updates.
"""

import asyncio
import time
import re

from services.supabase_service import (
    update_session_status, get_session,
    save_generated_file, get_session_sprint_cards, update_sprint_card_status
)
from services.websocket_service import manager
from pipeline.conflict_resolver import check_and_resolve_conflict
from pipeline.mood_engine import get_team_health
from pipeline.builder_dna import generate_builder_dna
from agents.all_agents import (
    PMAgent, ArchitectAgent, PMReplyAgent, DesignerAgent,
    BackendAgent, FrontendAgent, QAAgent, SecurityAgent,
    DevOpsAgent, AnalyticsAgent,
)

AGENT_PIPELINE = [
    PMAgent,
    ArchitectAgent,
    PMReplyAgent,
    DesignerAgent,
    BackendAgent,
    FrontendAgent,
    QAAgent,
    SecurityAgent,
    DevOpsAgent,
    AnalyticsAgent,
]

# ─── FILE EXTRACTION ──────────────────────────────────────────────────────────

LANGUAGE_MAP = {
    "python": ("py", "backend"),
    "py":     ("py", "backend"),
    "typescript": ("ts", "frontend"),
    "ts":     ("ts", "frontend"),
    "tsx":    ("tsx", "frontend"),
    "javascript": ("js", "frontend"),
    "js":     ("js", "frontend"),
    "jsx":    ("jsx", "frontend"),
    "sql":    ("sql", "database"),
    "yaml":   ("yaml", "devops"),
    "yml":    ("yml", "devops"),
    "json":   ("json", "config"),
    "dockerfile": ("dockerfile", "devops"),
    "bash":   ("sh", "devops"),
    "sh":     ("sh", "devops"),
    "css":    ("css", "frontend"),
    "html":   ("html", "frontend"),
    "markdown": ("md", "docs"),
    "md":     ("md", "docs"),
}

AGENT_FILE_TYPES = {
    "PM":        "docs",
    "Architect": "docs",
    "Designer":  "docs",
    "Backend":   "backend",
    "Frontend":  "frontend",
    "QA":        "test",
    "Security":  "docs",
    "DevOps":    "devops",
    "Analytics": "docs",
}

async def extract_and_save_files(session_id: str, agent_name: str, output: str):
    """
    Parse code blocks from agent output and save as generated files.
    Handles: ```language\ncode\n``` and filename comments.
    """
    if not output:
        return []

    saved = []

    # Pattern: ```language\n[optional # filename.ext or // filename.ext]\ncode\n```
    pattern = re.compile(
        r'```(\w+)?\n'           # opening fence + optional language
        r'(?:(?:#|//)\s*(.+?)\n)?'  # optional filename comment
        r'([\s\S]+?)'            # code content
        r'```',                  # closing fence
        re.MULTILINE
    )

    file_counter = {}

    for match in pattern.finditer(output):
        lang = (match.group(1) or "text").lower().strip()
        filename_hint = match.group(2)
        code = match.group(3).strip()

        if not code or len(code) < 20:
            continue

        # Determine extension and file type
        lang_info = LANGUAGE_MAP.get(lang, ("txt", AGENT_FILE_TYPES.get(agent_name, "docs")))
        ext, file_type = lang_info

        # Determine filename
        if filename_hint:
            filename = filename_hint.strip().split("/")[-1]
            filepath = filename_hint.strip()
        else:
            # Auto-generate meaningful filename
            file_counter[agent_name] = file_counter.get(agent_name, 0) + 1
            agent_short = agent_name.lower()
            filename = f"{agent_short}_{file_counter[agent_name]}.{ext}"
            filepath = f"{agent_short}/{filename}"

        try:
            saved_file = await save_generated_file(
                session_id=session_id,
                filename=filename,
                filepath=filepath,
                content=code,
                language=lang,
                agent_name=agent_name,
                file_type=file_type,
            )
            saved.append(saved_file)

            await manager.send_file_generated(session_id, {
                "filename": filename,
                "filepath": filepath,
                "language": lang,
                "agent_name": agent_name,
            })
        except Exception as e:
            print(f"[file_extract] Error saving {filepath}: {e}")

    return saved


# ─── SPRINT CARD UPDATES ──────────────────────────────────────────────────────

async def update_sprint_cards_for_agent(session_id: str, agent_name: str, phase: str):
    """
    Move sprint cards owned by this agent:
    - phase='start': todo → in_progress
    - phase='done':  in_progress → done
    """
    try:
        cards = await get_session_sprint_cards(session_id)
        for card in cards:
            if card.get("agent_owner") != agent_name:
                continue
            if phase == "start" and card.get("status") == "todo":
                await update_sprint_card_status(card["id"], "in_progress")
                await manager.send_sprint_update(session_id, {**card, "status": "in_progress"})
            elif phase == "done" and card.get("status") == "in_progress":
                await update_sprint_card_status(card["id"], "done")
                await manager.send_sprint_update(session_id, {**card, "status": "done"})
    except Exception as e:
        print(f"[sprint_update] Error: {e}")


# ─── MAIN PIPELINE ────────────────────────────────────────────────────────────

async def run_pipeline(session_id: str):
    start_time = time.time()
    context = {}

    try:
        session = await get_session(session_id)
        idea = session["idea"]
        solo_founder_mode = session.get("solo_founder_mode", False)

        await update_session_status(session_id, "running")
        await manager.send_to_session(session_id, "pipeline_started", {
            "total_agents": len(AGENT_PIPELINE),
            "idea": idea,
        })

        for i, AgentClass in enumerate(AGENT_PIPELINE):
            agent = AgentClass(
                session_id=session_id,
                idea=idea,
                outputs=context,
                solo_founder_mode=solo_founder_mode,
            )

            await manager.send_to_session(session_id, "agent_queued", {
                "agent_name": agent.name,
                "agent_emoji": agent.emoji,
                "position": i + 1,
                "total": len(AGENT_PIPELINE),
            })

            # Move sprint cards → in_progress
            await update_sprint_cards_for_agent(session_id, agent.name, "start")

            # Run the agent
            output = await agent.run()
            context[agent.name] = output

            # Extract files from output
            await extract_and_save_files(session_id, agent.name, output)

            # Move sprint cards → done
            await update_sprint_cards_for_agent(session_id, agent.name, "done")

            # Check for conflicts
            conflict = await check_and_resolve_conflict(
                session_id=session_id,
                agent_name=agent.name,
                output=output,
                context=context,
                idea=idea,
            )
            if conflict:
                context[f"CONFLICT_{agent.name}"] = conflict

            await asyncio.sleep(1.5)

        # ── COMPLETE ──────────────────────────────────────────────────────────
        total_time = int(time.time() - start_time)

        builder_dna = await generate_builder_dna(
            session_id=session_id,
            idea=idea,
            context=context,
        )

        health = get_team_health(context)

        await update_session_status(session_id, "complete", {
            "total_time_seconds": total_time,
            "estimated_manual_weeks": builder_dna.get("time_saved_weeks", 3.0),
            "builder_level": builder_dna.get("builder_level", "Senior"),
        })

        await manager.send_pipeline_complete(session_id, {
            "total_time_seconds": total_time,
            "agents_completed": len(AGENT_PIPELINE),
            "team_health": health,
            "builder_dna": builder_dna,
        })

    except Exception as e:
        await update_session_status(session_id, "failed")
        await manager.send_pipeline_error(session_id, str(e))
        raise e
