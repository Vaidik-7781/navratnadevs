"""Analytics Agent — Ananya, the Analytics Engineer."""
from agents.base_agent import BaseAgent
from prompts.analytics_prompts import get_analytics_prompt


class AnalyticsAgent(BaseAgent):
    name = "Analytics"
    emoji = "📊"
    output_type = "analytics"
    sequence_order = 10
    temperature = 0.8

    def get_prompts(self):
        return get_analytics_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Implement event tracking", "priority": "medium"},
            {"title": "Set up analytics dashboard", "priority": "medium"},
            {"title": "Define North Star metric", "priority": "high"},
            {"title": "Configure funnel analysis", "priority": "medium"},
        ]
