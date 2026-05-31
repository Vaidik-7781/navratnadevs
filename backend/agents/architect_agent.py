"""Architect Agent — Arjun, the Systems Architect."""
from agents.base_agent import BaseAgent
from prompts.architect_prompts import get_architect_prompt


class ArchitectAgent(BaseAgent):
    name = "Architect"
    emoji = "🏗️"
    output_type = "architecture"
    sequence_order = 2
    temperature = 0.7

    def get_prompts(self):
        return get_architect_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Define system architecture", "priority": "critical"},
            {"title": "Design database schema", "priority": "critical"},
            {"title": "Define API contracts", "priority": "high"},
            {"title": "Choose tech stack", "priority": "high"},
        ]
