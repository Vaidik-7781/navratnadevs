"""
NavratnaDevs — Test Suite
Tests pipeline, agents, services, and API endpoints.
Run: pytest tests/ -v
"""

import pytest
import asyncio
import sys
import os
from unittest.mock import AsyncMock, MagicMock, patch, Mock

# Mock external dependencies before any imports
sys.modules['groq'] = MagicMock()
sys.modules['supabase'] = MagicMock()
sys.modules['upstash_redis'] = MagicMock()
sys.modules['fastapi'] = MagicMock()
sys.modules['fastapi.websockets'] = MagicMock()
# Mock WebSocket class
mock_ws = MagicMock()
sys.modules['fastapi'].WebSocket = mock_ws
sys.modules['pydantic_settings'] = MagicMock()

# Make BaseSettings importable
class MockBaseSettings:
    class Config:
        env_file = '.env'
    def __init__(self, **kwargs):
        pass
sys.modules['pydantic_settings'].BaseSettings = MockBaseSettings

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Mock environment variables
os.environ.setdefault('GROQ_API_KEY', 'test-groq-key')
os.environ.setdefault('SUPABASE_URL', 'https://test.supabase.co')
os.environ.setdefault('SUPABASE_ANON_KEY', 'test-anon-key')
os.environ.setdefault('SUPABASE_SERVICE_KEY', 'test-service-key')
os.environ.setdefault('UPSTASH_REDIS_URL', 'https://test.upstash.io')
os.environ.setdefault('UPSTASH_REDIS_TOKEN', 'test-token')
os.environ.setdefault('APP_SECRET_KEY', 'test-secret-key-32-chars-minimum')

# ─── FIXTURES ─────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_idea():
    return "A task management app for remote teams with AI-powered prioritization"

@pytest.fixture
def sample_session_id():
    return "test-session-123e4567-e89b-12d3-a456-426614174000"

@pytest.fixture
def sample_context(sample_idea):
    return {
        "idea": sample_idea,
        "outputs": {},
        "solo_founder_mode": False,
    }

@pytest.fixture
def sample_pm_output():
    return """
## Problem Statement
Remote teams struggle with task prioritization and visibility.

## Core Features
1. AI task prioritization
2. Team dashboard
3. Integration with Slack
4. Time tracking

## User Stories
- As a PM, I want to see team velocity
- As a dev, I want clear task priorities

## Success Metrics
- DAU > 100 within 30 days
- Task completion rate > 80%

## Scope
IN: Core features listed above
OUT: Mobile app (v2)
"""

@pytest.fixture
def sample_architect_output():
    return """
## Recommended Stack
- Frontend: Next.js 14
- Backend: FastAPI
- DB: Supabase (PostgreSQL)
- Auth: Supabase Auth

## API Contract
POST /api/tasks - Create task
GET /api/tasks - List tasks
PATCH /api/tasks/{id} - Update task
DELETE /api/tasks/{id} - Delete task

## Database Design
tasks (id, title, priority, user_id, created_at)
users (id, email, team_id)
teams (id, name, created_at)
"""


# ─── PROMPT TESTS ─────────────────────────────────────────────────────────────

class TestPrompts:
    def test_pm_prompt_returns_tuple(self, sample_idea):
        from prompts.pm_prompts import get_pm_prompt
        system, user = get_pm_prompt(sample_idea, {})
        assert isinstance(system, str)
        assert isinstance(user, str)
        assert len(system) > 100
        assert sample_idea in user

    def test_pm_prompt_contains_codex_base(self, sample_idea):
        from prompts.pm_prompts import get_pm_prompt
        system, _ = get_pm_prompt(sample_idea, {})
        assert "Codex" in system or "NavratnaDevs" in system

    def test_pm_prompt_has_personality(self, sample_idea):
        from prompts.pm_prompts import get_pm_prompt
        system, _ = get_pm_prompt(sample_idea, {})
        assert "Priya" in system
        assert "Product Manager" in system

    def test_architect_prompt_returns_tuple(self, sample_idea):
        from prompts.architect_prompts import get_architect_prompt
        system, user = get_architect_prompt(sample_idea, {})
        assert isinstance(system, str)
        assert isinstance(user, str)

    def test_architect_challenges_pm(self, sample_idea, sample_pm_output):
        from prompts.architect_prompts import get_architect_prompt
        outputs = {"PM": sample_pm_output}
        system, user = get_architect_prompt(sample_idea, outputs)
        assert "Arjun" in system
        assert "challenge" in system.lower() or "cut" in system.lower()

    def test_all_prompts_importable(self, sample_idea):
        from prompts.designer_prompts import get_designer_prompt
        from prompts.backend_prompts import get_backend_prompt
        from prompts.frontend_prompts import get_frontend_prompt
        from prompts.qa_prompts import get_qa_prompt
        from prompts.security_prompts import get_security_prompt
        from prompts.devops_prompts import get_devops_prompt
        from prompts.analytics_prompts import get_analytics_prompt

        for fn in [get_designer_prompt, get_backend_prompt, get_frontend_prompt,
                   get_qa_prompt, get_security_prompt, get_devops_prompt, get_analytics_prompt]:
            s, u = fn(sample_idea, {})
            assert isinstance(s, str) and len(s) > 50
            assert isinstance(u, str) and len(u) > 10

    def test_solo_founder_mode_injects_context(self, sample_idea):
        from prompts.base_prompt import build_context_summary
        summary = build_context_summary({}, solo_founder_mode=True)
        # Solo founder mode adds context about free tools
        assert isinstance(summary, str) and len(summary) > 0

    def test_context_summary_builds_correctly(self, sample_idea, sample_pm_output):
        from prompts.base_prompt import build_context_summary
        outputs = {"PM": sample_pm_output, "Architect": "some arch output"}
        summary = build_context_summary(outputs)
        assert "PM" in summary
        assert "Architect" in summary


# ─── AGENT TESTS ──────────────────────────────────────────────────────────────

class TestAgents:
    def test_all_agents_importable(self):
        from agents.pm_agent import PMAgent, PMReplyAgent
        from agents.architect_agent import ArchitectAgent
        from agents.designer_agent import DesignerAgent
        from agents.backend_agent import BackendAgent
        from agents.frontend_agent import FrontendAgent
        from agents.qa_agent import QAAgent
        from agents.security_agent import SecurityAgent
        from agents.devops_agent import DevOpsAgent
        from agents.analytics_agent import AnalyticsAgent
        assert True

    def test_all_agents_have_required_attributes(self):
        from agents.all_agents import (
            PMAgent, ArchitectAgent, DesignerAgent, BackendAgent,
            FrontendAgent, QAAgent, SecurityAgent, DevOpsAgent, AnalyticsAgent
        )
        agents = [PMAgent, ArchitectAgent, DesignerAgent, BackendAgent,
                  FrontendAgent, QAAgent, SecurityAgent, DevOpsAgent, AnalyticsAgent]

        for AgentClass in agents:
            assert hasattr(AgentClass, 'name'), f"{AgentClass.__name__} missing 'name'"
            assert hasattr(AgentClass, 'emoji'), f"{AgentClass.__name__} missing 'emoji'"
            assert hasattr(AgentClass, 'output_type'), f"{AgentClass.__name__} missing 'output_type'"
            assert hasattr(AgentClass, 'sequence_order'), f"{AgentClass.__name__} missing 'sequence_order'"

    def test_agent_sequence_orders_are_unique(self):
        from agents.all_agents import (
            PMAgent, ArchitectAgent, DesignerAgent, BackendAgent,
            FrontendAgent, QAAgent, SecurityAgent, DevOpsAgent, AnalyticsAgent
        )
        agents = [PMAgent, ArchitectAgent, DesignerAgent, BackendAgent,
                  FrontendAgent, QAAgent, SecurityAgent, DevOpsAgent, AnalyticsAgent]
        orders = [a.sequence_order for a in agents]
        assert len(orders) == len(set(orders)), "Duplicate sequence orders found"

    def test_pm_agent_get_prompts(self, sample_idea, sample_session_id):
        from agents.pm_agent import PMAgent
        agent = PMAgent(sample_session_id, sample_idea, {})
        system, user = agent.get_prompts()
        assert isinstance(system, str)
        assert isinstance(user, str)
        assert sample_idea in user

    def test_pm_agent_sprint_cards_not_empty(self, sample_idea, sample_session_id):
        from agents.pm_agent import PMAgent
        agent = PMAgent(sample_session_id, sample_idea, {})
        cards = agent.get_sprint_cards()
        assert len(cards) > 0
        assert all("title" in c for c in cards)
        assert all("priority" in c for c in cards)

    def test_pm_reply_agent_has_empty_sprint_cards(self, sample_idea, sample_session_id):
        from agents.pm_agent import PMReplyAgent
        agent = PMReplyAgent(sample_session_id, sample_idea, {})
        assert agent.get_sprint_cards() == []

    def test_all_agent_sprint_cards_have_valid_priorities(self, sample_idea, sample_session_id):
        from agents.all_agents import (
            PMAgent, ArchitectAgent, DesignerAgent, BackendAgent,
            FrontendAgent, QAAgent, SecurityAgent, DevOpsAgent, AnalyticsAgent
        )
        valid_priorities = {"low", "medium", "high", "critical"}
        for AgentClass in [PMAgent, ArchitectAgent, DesignerAgent, BackendAgent,
                           FrontendAgent, QAAgent, SecurityAgent, DevOpsAgent, AnalyticsAgent]:
            agent = AgentClass(sample_session_id, sample_idea, {})
            for card in agent.get_sprint_cards():
                assert card["priority"] in valid_priorities


# ─── MOOD ENGINE TESTS ────────────────────────────────────────────────────────

class TestMoodEngine:
    def test_calculate_mood_returns_emoji(self):
        from pipeline.mood_engine import calculate_mood
        mood = calculate_mood("PM", {}, "I am excited about this product!")
        assert isinstance(mood, str)
        assert len(mood) > 0

    def test_qa_mood_smug_when_many_bugs(self):
        from pipeline.mood_engine import calculate_mood
        output_with_bugs = "Bug Bug Bug Bug Bug issue issue issue error error"
        mood = calculate_mood("QA", {}, output_with_bugs)
        assert mood in ["😏", "🚨", "🔍"]

    def test_security_mood_alarmed_with_vulnerabilities(self):
        from pipeline.mood_engine import calculate_mood
        output = "Critical vulnerability found. SQL injection detected."
        mood = calculate_mood("Security", {}, output)
        assert mood in ["🚨", "🛑", "👀", "🔐"]

    def test_get_team_health_returns_dict(self):
        from pipeline.mood_engine import get_team_health
        outputs = {"PM": "test output", "Architect": "disagree challenge"}
        health = get_team_health(outputs)
        assert "morale" in health
        assert "conflicts" in health
        assert "velocity" in health
        assert "risk_level" in health
        assert isinstance(health["morale"], int)
        assert 1 <= health["morale"] <= 10

    def test_team_health_morale_decreases_with_conflicts(self):
        from pipeline.mood_engine import get_team_health
        peaceful = {"PM": "great work", "Architect": "looks good"}
        conflicted = {"PM": "disagree disagree disagree", "Architect": "wrong wrong wrong challenge"}
        h1 = get_team_health(peaceful)
        h2 = get_team_health(conflicted)
        assert h2["morale"] <= h1["morale"]


# ─── CONFLICT RESOLVER TESTS ──────────────────────────────────────────────────

class TestConflictResolver:
    def test_conflict_detection_pm_architect(self):
        from pipeline.conflict_resolver import check_and_resolve_conflict
        # Does not actually call API in this test
        assert callable(check_and_resolve_conflict)

    def test_conflict_signals_exist(self):
        from pipeline.conflict_resolver import CONFLICT_SIGNALS
        assert ("PM", "Architect") in CONFLICT_SIGNALS
        assert ("Backend", "Frontend") in CONFLICT_SIGNALS
        assert ("Security", "Backend") in CONFLICT_SIGNALS

    def test_detect_conflict_topic_extracts_sentence(self):
        from pipeline.conflict_resolver import detect_conflict_topic
        output = "This is fine. The approach is too complex for MVP. We should cut it."
        topic = detect_conflict_topic("Architect", output, ["too complex"])
        assert "too complex" in topic.lower()


# ─── CONTEXT MANAGER TESTS ────────────────────────────────────────────────────

class TestContextManager:
    def test_context_manager_add_output(self, sample_idea):
        from pipeline.context_manager import ContextManager
        ctx = ContextManager(sample_idea)
        ctx.add_output("PM", "PRD content here")
        assert ctx.has_output("PM")
        assert ctx.get_output("PM") == "PRD content here"

    def test_context_manager_summary(self, sample_idea):
        from pipeline.context_manager import ContextManager
        ctx = ContextManager(sample_idea)
        ctx.add_output("PM", "output1")
        ctx.add_output("Architect", "output2")
        summary = ctx.summary()
        assert summary["agents_completed"] == 2
        assert summary["sequence"] == 2

    def test_context_manager_conflict_adds_resolution_to_outputs(self, sample_idea):
        from pipeline.context_manager import ContextManager
        ctx = ContextManager(sample_idea)
        ctx.add_conflict({
            "agent_a": "PM",
            "agent_b": "Architect",
            "topic": "Feature count",
            "winner": "Architect",
            "resolution": "Scope cut to 4 features"
        })
        assert ctx.conflicts[0]["winner"] == "Architect"
        # Resolution should appear in outputs
        conflict_keys = [k for k in ctx.outputs if k.startswith("CONFLICT_")]
        assert len(conflict_keys) == 1

    def test_context_for_agent_includes_all_fields(self, sample_idea):
        from pipeline.context_manager import ContextManager
        ctx = ContextManager(sample_idea, solo_founder_mode=True)
        ctx.add_output("PM", "pm output")
        context = ctx.get_context_for_agent("Architect")
        assert context["idea"] == sample_idea
        assert context["solo_founder_mode"] is True
        assert "PM" in context["outputs"]


# ─── API ROUTER TESTS ─────────────────────────────────────────────────────────

class TestRouters:
    def test_sessions_router_has_required_routes(self):
        with open('routers/sessions.py') as f: src = f.read()
        assert '/create' in src
        assert 'start' in src
        assert 'session_id' in src

    def test_outputs_router_has_required_routes(self):
        with open('routers/outputs.py') as f: src = f.read()
        assert 'messages' in src
        assert 'files' in src
        assert 'full' in src

    def test_agents_router_has_roster_route(self):
        with open('routers/agents.py') as f: src = f.read()
        assert 'roster' in src

    def test_share_router_has_required_routes(self):
        with open('routers/share.py') as f: src = f.read()
        assert 'share_token' in src or 'session_id' in src


# ─── MODEL TESTS ──────────────────────────────────────────────────────────────

class TestModels:
    def test_session_create_validation(self):
        from models.session import SessionCreate
        sc = SessionCreate(idea="Build a task manager with AI", solo_founder_mode=False)
        assert sc.idea == "Build a task manager with AI"
        assert sc.solo_founder_mode is False

    def test_session_create_rejects_short_idea(self):
        from models.session import SessionCreate
        with pytest.raises(Exception):
            SessionCreate(idea="Short")  # min_length=10

    def test_agent_output_model(self):
        from models.agent_output import AgentOutput
        ao = AgentOutput(
            session_id="test-id",
            agent_name="PM",
            agent_emoji="🧠",
            message="Here is the PRD",
            output_type="prd",
            mood="💼",
            sequence_order=1,
        )
        assert ao.agent_name == "PM"

    def test_vote_model_valid_values(self):
        from models.vote import Vote
        v = Vote(session_id="sid", question="Use React?", agent_name="Frontend", vote="yes")
        assert v.vote == "yes"

    def test_conflict_model_defaults(self):
        from models.conflict import Conflict
        c = Conflict(session_id="sid", agent_a="PM", agent_b="Architect", topic="Scope")
        assert c.votes_for_a == 0
        assert c.votes_for_b == 0


# ─── PIPELINE ORCHESTRATOR TESTS ─────────────────────────────────────────────

class TestOrchestrator:
    def test_agent_pipeline_has_10_agents(self):
        from pipeline.orchestrator import AGENT_PIPELINE
        assert len(AGENT_PIPELINE) == 10  # 9 agents + PM Reply

    def test_agent_pipeline_includes_pm_reply(self):
        from pipeline.orchestrator import AGENT_PIPELINE
        from agents.pm_agent import PMReplyAgent
        assert PMReplyAgent in AGENT_PIPELINE

    def test_agent_pipeline_starts_with_pm(self):
        from pipeline.orchestrator import AGENT_PIPELINE
        from agents.pm_agent import PMAgent
        assert AGENT_PIPELINE[0] == PMAgent

    def test_agent_pipeline_ends_with_analytics(self):
        from pipeline.orchestrator import AGENT_PIPELINE
        from agents.analytics_agent import AnalyticsAgent
        assert AGENT_PIPELINE[-1] == AnalyticsAgent


# ─── INTEGRATION SMOKE TEST ───────────────────────────────────────────────────

class TestIntegration:
    """Smoke tests — verify all modules load without import errors."""

    def test_all_agents_load(self):
        import agents.pm_agent
        import agents.architect_agent
        import agents.designer_agent
        import agents.backend_agent
        import agents.frontend_agent
        import agents.qa_agent
        import agents.security_agent
        import agents.devops_agent
        import agents.analytics_agent
        assert True

    def test_all_prompts_load(self):
        import prompts.pm_prompts
        import prompts.architect_prompts
        import prompts.designer_prompts
        import prompts.backend_prompts
        import prompts.frontend_prompts
        import prompts.qa_prompts
        import prompts.security_prompts
        import prompts.devops_prompts
        import prompts.analytics_prompts
        assert True

    def test_all_pipeline_modules_load(self):
        import pipeline.orchestrator
        import pipeline.conflict_resolver
        import pipeline.mood_engine
        import pipeline.voting_engine
        import pipeline.context_manager
        import pipeline.codex_flow
        assert True

    def test_all_routers_load(self):
        # Verify router files exist and are syntactically valid
        import ast, os
        for f in ['routers/sessions.py','routers/agents.py','routers/outputs.py','routers/share.py','routers/auth.py']:
            assert os.path.exists(f), f"{f} missing"
            ast.parse(open(f).read())  # syntax check
        assert True

    def test_websocket_manager_is_singleton(self):
        from services.websocket_service import manager
        from services.websocket_service import manager as manager2
        assert manager is manager2
