"""Frontend Agent — Farhan, the Frontend Engineer."""
from agents.base_agent import BaseAgent
from prompts.frontend_prompts import get_frontend_prompt


class FrontendAgent(BaseAgent):
    name = "Frontend"
    emoji = "🖥️"
    output_type = "code"
    sequence_order = 6
    temperature = 0.7
    max_tokens = 4000

    def get_prompts(self):
        return get_frontend_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Build all React components", "priority": "critical"},
            {"title": "Implement state management", "priority": "high"},
            {"title": "Integrate with backend API", "priority": "critical"},
            {"title": "Implement routing & navigation", "priority": "high"},
            {"title": "Loading states & error boundaries", "priority": "medium"},
        ]
