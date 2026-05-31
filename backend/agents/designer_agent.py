"""Designer Agent — Disha, the UI/UX Designer."""
from agents.base_agent import BaseAgent
from prompts.designer_prompts import get_designer_prompt


class DesignerAgent(BaseAgent):
    name = "Designer"
    emoji = "🎨"
    output_type = "design"
    sequence_order = 4
    temperature = 0.85

    def get_prompts(self):
        return get_designer_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Create design system & color palette", "priority": "high"},
            {"title": "Map complete user flow", "priority": "high"},
            {"title": "Design all UI components", "priority": "medium"},
            {"title": "Accessibility audit checklist", "priority": "medium"},
        ]
