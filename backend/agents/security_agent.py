"""Security Agent — Shreya, the Security Engineer."""
from agents.base_agent import BaseAgent
from prompts.security_prompts import get_security_prompt


class SecurityAgent(BaseAgent):
    name = "Security"
    emoji = "🔐"
    output_type = "security"
    sequence_order = 8
    temperature = 0.7

    def get_prompts(self):
        return get_security_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Fix all CRITICAL security vulnerabilities", "priority": "critical"},
            {"title": "Input validation & sanitization", "priority": "critical"},
            {"title": "Auth security hardening", "priority": "critical"},
            {"title": "Data exposure audit", "priority": "high"},
        ]
