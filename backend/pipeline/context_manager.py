from __future__ import annotations
"""
Context Manager — Builds and manages shared context between all 9 agents.
This is what gives agents "memory" of what colleagues said.
"""


class ContextManager:
    """
    Holds all agent outputs for a session.
    Each agent reads previous outputs via this manager.
    """

    def __init__(self, idea: str, solo_founder_mode: bool = False):
        self.idea = idea
        self.solo_founder_mode = solo_founder_mode
        self.outputs: dict[str, str] = {}
        self.conflicts: list[dict] = []
        self.files_generated: list[str] = []
        self.sequence: int = 0

    def add_output(self, agent_name: str, output: str):
        self.outputs[agent_name] = output
        self.sequence += 1

    def add_conflict(self, conflict: dict):
        self.conflicts.append(conflict)
        # Also add resolution to context so later agents know outcome
        if conflict.get("winner") and conflict.get("resolution"):
            key = f"CONFLICT_{conflict['agent_a']}_vs_{conflict['agent_b']}"
            self.outputs[key] = (
                f"RESOLVED CONFLICT: {conflict['topic']}\n"
                f"Winner: {conflict['winner']}\n"
                f"Resolution: {conflict['resolution']}"
            )

    def add_file(self, filepath: str):
        self.files_generated.append(filepath)

    def get_context_for_agent(self, agent_name: str) -> dict:
        """Return all context an agent needs to do its job."""
        return {
            "idea": self.idea,
            "solo_founder_mode": self.solo_founder_mode,
            "outputs": self.outputs.copy(),
            "conflicts_resolved": len(self.conflicts),
            "files_so_far": self.files_generated.copy(),
        }

    def has_output(self, agent_name: str) -> bool:
        return agent_name in self.outputs

    def get_output(self, agent_name: str) -> str:
        return self.outputs.get(agent_name, "")

    def summary(self) -> dict:
        return {
            "agents_completed": len([k for k in self.outputs if not k.startswith("CONFLICT")]),
            "conflicts": len(self.conflicts),
            "files_generated": len(self.files_generated),
            "sequence": self.sequence,
        }
