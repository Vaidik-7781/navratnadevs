"""
NavratnaDevs — AI Service via Cerebras
1M tokens/day free. 1800+ tokens/sec. No rate limit issues for demo.
Get free key at cloud.cerebras.ai → API Keys → Create Key
Add to .env: CEREBRAS_API_KEY=your_key_here
"""

import os
import asyncio
import time
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# ─── CLIENT ───────────────────────────────────────────────────────────────────
client = AsyncOpenAI(
    api_key=os.getenv("CEREBRAS_API_KEY", ""),
    base_url="https://api.cerebras.ai/v1",
)

# ─── MODEL ────────────────────────────────────────────────────────────────────
MODEL = "gpt-oss-120b"  # Cerebras model name (no prefix needed) 

# ─── MAX TOKENS PER AGENT ─────────────────────────────────────────────────────
AGENT_MAX_TOKENS = {
    "PM":        800,
    "Architect": 800,
    "Designer":  700,
    "Backend":   900,
    "Frontend":  900,
    "QA":        700,
    "Security":  600,
    "DevOps":    600,
    "Analytics": 600,
    "PMReply":   500,
}

# ─── MAIN STREAM FUNCTION ─────────────────────────────────────────────────────

async def collect_stream(
    system_prompt: str,
    user_message: str,
    on_chunk=None,
    temperature: float = 0.85,
    max_tokens: int = 800,
    agent_name: str = "PM",
) -> str:
    max_tok = AGENT_MAX_TOKENS.get(agent_name, 800)
    full = ""

    for attempt in range(3):
        try:
            stream = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
                temperature=temperature,
                max_tokens=max_tok,
                stream=True,
            )

            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    full += delta
                    if on_chunk:
                        await on_chunk(delta)

            return full

        except Exception as e:
            err = str(e).lower()
            is_rate = any(x in err for x in ["rate_limit", "429", "quota", "too many"])
            if is_rate and attempt < 2:
                wait = (attempt + 1) * 10
                print(f"[{agent_name}] Rate limited. Retrying in {wait}s...")
                await asyncio.sleep(wait)
                continue
            print(f"[{agent_name}] ERROR: {e}")
            raise e

    raise RuntimeError(f"[{agent_name}] Failed after 3 retries")


# ─── BACKWARD COMPAT ──────────────────────────────────────────────────────────

async def call_agent(
    system_prompt: str,
    user_message: str,
    temperature: float = 0.85,
    max_tokens: int = 800,
    agent_name: str = "PM",
) -> tuple:
    start = time.time()
    response = await collect_stream(
        system_prompt, user_message, None,
        temperature, max_tokens, agent_name
    )
    duration = (time.time() - start) * 1000
    return response, 0, duration


def get_agent_provider(agent_name: str) -> str:
    return "cerebras/llama-3.3-70b"