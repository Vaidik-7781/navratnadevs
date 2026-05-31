"""Backend Agent — Bharat, the Backend Engineer."""
from agents.base_agent import BaseAgent
from prompts.backend_prompts import get_backend_prompt


class BackendAgent(BaseAgent):
    name = "Backend"
    emoji = "⚙️"
    output_type = "code"
    sequence_order = 5
    temperature = 0.7
    max_tokens = 4000

    def get_prompts(self):
        return get_backend_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Implement all API routes", "priority": "critical"},
            {"title": "Set up database models & migrations", "priority": "critical"},
            {"title": "Implement authentication & authorization", "priority": "critical"},
            {"title": "Write core business logic", "priority": "high"},
            {"title": "Error handling & validation", "priority": "high"},
        ]
