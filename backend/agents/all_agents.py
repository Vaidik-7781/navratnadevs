"""
All 9 NavratnaDevs Agents — imports from individual agent files.
Use this for the orchestrator pipeline.
"""
from agents.pm_agent import PMAgent, PMReplyAgent
from agents.architect_agent import ArchitectAgent
from agents.designer_agent import DesignerAgent
from agents.backend_agent import BackendAgent
from agents.frontend_agent import FrontendAgent
from agents.qa_agent import QAAgent
from agents.security_agent import SecurityAgent
from agents.devops_agent import DevOpsAgent
from agents.analytics_agent import AnalyticsAgent

__all__ = [
    'PMAgent', 'PMReplyAgent', 'ArchitectAgent', 'DesignerAgent',
    'BackendAgent', 'FrontendAgent', 'QAAgent', 'SecurityAgent',
    'DevOpsAgent', 'AnalyticsAgent',
]
