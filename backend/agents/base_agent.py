"""
Base Agent — All 9 agents inherit from this.
Handles Groq/Gemini calls, WebSocket streaming, DB saving, mood calculation.
"""

import time
from datetime import datetime
from abc import ABC, abstractmethod
from services.groq_service import collect_stream, get_agent_provider
from services.supabase_service import save_agent_output, save_sprint_card, save_mood
from services.websocket_service import manager
from pipeline.mood_engine import calculate_mood


class BaseAgent(ABC):
    name: str = ""
    emoji: str = ""
    output_type: str = ""
    sequence_order: int = 0
    temperature: float = 0.85
    max_tokens: int = 1000

    def __init__(self, session_id: str, idea: str, outputs: dict, solo_founder_mode: bool = False):
        self.session_id = session_id
        self.idea = idea
        self.outputs = outputs
        self.solo_founder_mode = solo_founder_mode

    @abstractmethod
    def get_prompts(self) -> tuple[str, str]:
        """Return (system_prompt, user_message)"""
        pass

    def get_sprint_cards(self) -> list[dict]:
        return []

    async def run(self) -> str:
        system_prompt, user_message = self.get_prompts()
        start_time = time.time()

        await manager.send_api_call_log(self.session_id, self.name, "calling")

        await manager.send_to_session(self.session_id, "agent_thinking", {
            "agent_name":  self.name,
            "agent_emoji": self.emoji,
        })

        full_response = ""

        async def on_chunk(chunk: str):
            nonlocal full_response
            full_response += chunk
            await manager.stream_token(self.session_id, self.name, chunk)

        try:
            # agent_name routes to correct provider + key in groq_service
            full_response = await collect_stream(
                system_prompt=system_prompt,
                user_message=user_message,
                on_chunk=on_chunk,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                agent_name=self.name,        # ← ONLY CHANGE from original
            )
        except Exception as e:
            await manager.send_pipeline_error(self.session_id, f"{self.name} failed: {str(e)}")
            raise e

        duration_ms = int((time.time() - start_time) * 1000)
        mood = calculate_mood(self.name, self.outputs, full_response)

        await save_agent_output(
            session_id=self.session_id,
            agent_name=self.name,
            agent_emoji=self.emoji,
            message=full_response,
            output_type=self.output_type,
            mood=mood,
            sequence_order=self.sequence_order,
            metadata={"duration_ms": duration_ms},
        )

        await save_mood(self.session_id, self.name, mood)

        await manager.send_api_call_log(self.session_id, self.name, "done", duration_ms)

        await manager.send_agent_message(self.session_id, {
            "agent_name":     self.name,
            "agent_emoji":    self.emoji,
            "message":        full_response,
            "output_type":    self.output_type,
            "mood":           mood,
            "sequence_order": self.sequence_order,
            "duration_ms":    duration_ms,
            "timestamp":      datetime.utcnow().isoformat(),
        })

        await manager.send_mood_update(self.session_id, self.name, mood, "")

        for card in self.get_sprint_cards():
            saved = await save_sprint_card(
                session_id=self.session_id,
                title=card["title"],
                description=card.get("description", ""),
                agent_owner=self.name,
                priority=card.get("priority", "medium"),
            )
            await manager.send_sprint_update(self.session_id, saved)

        return full_response