"""PM Agent — Priya, the Product Manager."""
from agents.base_agent import BaseAgent
from prompts.pm_prompts import get_pm_prompt, get_pm_reply_prompt


class PMAgent(BaseAgent):
    name = "PM"
    emoji = "🧠"
    output_type = "prd"
    sequence_order = 1
    temperature = 0.9

    def get_prompts(self):
        return get_pm_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Write Product Requirements Document", "priority": "critical"},
            {"title": "Define user personas", "priority": "high"},
            {"title": "Set success metrics & KPIs", "priority": "high"},
            {"title": "Scope MVP vs v2 features", "priority": "high"},
        ]


class PMReplyAgent(BaseAgent):
    """PM responds to Architect's challenge — creates visible debate."""
    name = "PM"
    emoji = "🧠"
    output_type = "debate"
    sequence_order = 3
    temperature = 0.9

    def get_prompts(self):
        return get_pm_reply_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return []
