"""
Mood Engine — Agents have feelings. Real ones.
Calculates mood based on what happened in the pipeline.
"""


AGENT_MOODS = {
    "PM": {
        "default": "💼",
        "excited": "🤩",
        "defensive": "😤",
        "worried": "😰",
        "satisfied": "😊",
        "disappointed": "😞",
    },
    "Architect": {
        "default": "🏗️",
        "happy": "😌",        # when complexity is low
        "annoyed": "😤",      # when PM wants too many features
        "focused": "🎯",
        "concerned": "🤔",
    },
    "Designer": {
        "default": "🎨",
        "inspired": "✨",
        "frustrated": "😤",   # when backend ignores UX
        "proud": "🥹",
        "focused": "🎯",
    },
    "Backend": {
        "default": "⚙️",
        "grinding": "💪",
        "annoyed": "😒",      # when frontend argues
        "confident": "😎",
        "stressed": "😰",
    },
    "Frontend": {
        "default": "🖥️",
        "coding": "⚡",
        "arguing": "🗣️",      # arguing with backend
        "proud": "😎",
        "focused": "🎯",
    },
    "QA": {
        "default": "🔍",
        "smug": "😏",         # found many bugs
        "suspicious": "🤨",   # no bugs found (impossible)
        "satisfied": "✅",
        "alarmed": "🚨",      # critical bugs
    },
    "Security": {
        "default": "🔐",
        "alarmed": "🚨",      # found critical issues
        "paranoid": "👀",     # always slightly paranoid
        "relieved": "😮‍💨",
        "blocking": "🛑",
    },
    "DevOps": {
        "default": "📈",
        "shipping": "🚀",
        "configuring": "⚙️",
        "done": "✅",
    },
    "Analytics": {
        "default": "📊",
        "tracking": "📡",
        "analyzing": "🧮",
        "excited": "📈",
    },
}


def calculate_mood(agent_name: str, outputs: dict, current_output: str) -> str:
    """
    Calculate agent's current mood based on pipeline context.
    Returns mood emoji.
    """
    moods = AGENT_MOODS.get(agent_name, {})

    try:
        if agent_name == "PM":
            # PM is defensive if Architect challenged them
            if "Architect" in outputs and ("cut" in outputs["Architect"].lower() or "too complex" in outputs["Architect"].lower()):
                return moods.get("defensive", "😤")
            if "I agree" in current_output or "good point" in current_output.lower():
                return moods.get("satisfied", "😊")
            return moods.get("excited", "🤩")

        elif agent_name == "Architect":
            # Happy when he gets to simplify things
            if "simplify" in current_output.lower() or "remove" in current_output.lower():
                return moods.get("happy", "😌")
            # Annoyed if PM has too many features
            if "PM" in outputs and outputs["PM"].count("Feature") > 6:
                return moods.get("annoyed", "😤")
            return moods.get("focused", "🎯")

        elif agent_name == "QA":
            # Smug when bugs found
            bug_count = current_output.lower().count("bug") + current_output.lower().count("issue") + current_output.lower().count("error")
            if bug_count >= 5:
                return moods.get("smug", "😏")
            if "critical" in current_output.lower():
                return moods.get("alarmed", "🚨")
            return moods.get("suspicious", "🤨")  # No bugs? Impossible.

        elif agent_name == "Security":
            if "critical" in current_output.lower() or "vulnerability" in current_output.lower():
                return moods.get("alarmed", "🚨")
            if "injection" in current_output.lower() or "owasp" in current_output.lower():
                return moods.get("blocking", "🛑")
            return moods.get("paranoid", "👀")

        elif agent_name == "Frontend":
            # Arguing if they disagree with backend
            if "Bharat" in current_output or "disagree" in current_output.lower():
                return moods.get("arguing", "🗣️")
            return moods.get("coding", "⚡")

        elif agent_name == "Backend":
            if "Farhan" in current_output and "disagree" in current_output.lower():
                return moods.get("annoyed", "😒")
            return moods.get("grinding", "💪")

        elif agent_name == "DevOps":
            return moods.get("shipping", "🚀")

        elif agent_name == "Analytics":
            return moods.get("excited", "📈")

        elif agent_name == "Designer":
            if "Backend" in current_output or "API" in current_output:
                return moods.get("frustrated", "😤")
            return moods.get("inspired", "✨")

    except Exception:
        pass

    return moods.get("default", "💼")


def get_team_health(outputs: dict) -> dict:
    """Calculate overall team health metrics."""
    conflicts = 0
    blockers = 0

    all_text = " ".join(str(v) for v in outputs.values()).lower()

    conflicts = all_text.count("disagree") + all_text.count("challenge") + all_text.count("wrong")
    blockers = all_text.count("critical") + all_text.count("blocking") + all_text.count("must fix")

    morale = max(1, min(10, 8 - conflicts))
    velocity = "High" if len(outputs) >= 5 else "Medium" if len(outputs) >= 3 else "Starting"
    risk = "High" if blockers > 5 else "Medium" if blockers > 2 else "Low"

    return {
        "morale": morale,
        "conflicts": conflicts,
        "blockers": blockers,
        "velocity": velocity,
        "risk_level": risk,
    }
