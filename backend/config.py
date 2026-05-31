"""
NavratnaDevs — Centralised Configuration
Single source of truth for all settings.
"""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ─── AI ───────────────────────────────────────────────────────────────────
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"
    groq_fallback_model: str = "llama-3.1-8b-instant"

    # ─── DATABASE ─────────────────────────────────────────────────────────────
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    # ─── REDIS ────────────────────────────────────────────────────────────────
    upstash_redis_url: str = ""
    upstash_redis_token: str = ""

    # ─── APP ──────────────────────────────────────────────────────────────────
    app_secret_key: str = "dev-secret-change-in-production"
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"

    # ─── AUTH ─────────────────────────────────────────────────────────────────
    jwt_secret: str = "dev-jwt-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days

    # ─── AGENT SETTINGS ───────────────────────────────────────────────────────
    agent_max_tokens: int = 3000
    agent_temperature: float = 0.85
    agent_stream: bool = True
    agent_delay_seconds: float = 1.5  # breathing room between agents

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance. Call this everywhere instead of os.environ."""
    return Settings()


# Convenience export
settings = get_settings()
