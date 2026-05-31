"""DevOps Agent — Dev, the DevOps Engineer."""
from agents.base_agent import BaseAgent
from prompts.devops_prompts import get_devops_prompt


class DevOpsAgent(BaseAgent):
    name = "DevOps"
    emoji = "📈"
    output_type = "devops"
    sequence_order = 9
    temperature = 0.65

    def get_prompts(self):
        return get_devops_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Write Dockerfiles (frontend + backend)", "priority": "high"},
            {"title": "Set up CI/CD GitHub Actions", "priority": "high"},
            {"title": "Configure environment variables", "priority": "high"},
            {"title": "Deploy to Vercel + Railway", "priority": "critical"},
            {"title": "Set up monitoring & health checks", "priority": "medium"},
        ]
