from __future__ import annotations
"""
Redis Service — Queue and caching via Upstash Redis (free tier).
Used for: session state caching, rate limiting, pipeline queue.
"""

import os
import json
from upstash_redis import Redis
from dotenv import load_dotenv

load_dotenv()

redis = Redis(
    url=os.environ.get("UPSTASH_REDIS_URL", ""),
    token=os.environ.get("UPSTASH_REDIS_TOKEN", ""),
)

SESSION_TTL = 60 * 60 * 24  # 24 hours


async def cache_session(session_id: str, data: dict):
    """Cache session data for fast reads."""
    try:
        redis.setex(f"session:{session_id}", SESSION_TTL, json.dumps(data))
    except Exception:
        pass  # Redis is optional — fall back to Supabase


async def get_cached_session(session_id: str) -> dict | None:
    """Get session from cache first."""
    try:
        cached = redis.get(f"session:{session_id}")
        if cached:
            return json.loads(cached)
    except Exception:
        pass
    return None


async def invalidate_session(session_id: str):
    """Clear cache when session updates."""
    try:
        redis.delete(f"session:{session_id}")
    except Exception:
        pass


async def set_pipeline_running(session_id: str):
    """Mark pipeline as running — prevents duplicate starts."""
    try:
        redis.setex(f"pipeline:running:{session_id}", 3600, "1")
    except Exception:
        pass


async def is_pipeline_running(session_id: str) -> bool:
    """Check if pipeline is already running."""
    try:
        return bool(redis.get(f"pipeline:running:{session_id}"))
    except Exception:
        return False


async def clear_pipeline_lock(session_id: str):
    """Release pipeline lock on completion."""
    try:
        redis.delete(f"pipeline:running:{session_id}")
    except Exception:
        pass
