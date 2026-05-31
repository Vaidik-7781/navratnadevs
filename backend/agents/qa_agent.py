"""QA Agent — Qadir, the QA Engineer."""
from agents.base_agent import BaseAgent
from prompts.qa_prompts import get_qa_prompt


class QAAgent(BaseAgent):
    name = "QA"
    emoji = "🔍"
    output_type = "bug"
    sequence_order = 7
    temperature = 0.75

    def get_prompts(self):
        return get_qa_prompt(self.idea, self.outputs, self.solo_founder_mode)

    def get_sprint_cards(self):
        return [
            {"title": "Fix all CRITICAL bugs from QA report", "priority": "critical"},
            {"title": "Write unit test suite", "priority": "high"},
            {"title": "Write integration tests", "priority": "high"},
            {"title": "Test all edge cases", "priority": "medium"},
        ]
