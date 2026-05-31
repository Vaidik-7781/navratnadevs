"""
Agent prompts — re-exports all individual prompt functions.
Kept for backward compatibility. Import from individual files preferred.
"""
from prompts.designer_prompts import get_designer_prompt
from prompts.backend_prompts import get_backend_prompt
from prompts.frontend_prompts import get_frontend_prompt
from prompts.qa_prompts import get_qa_prompt
from prompts.security_prompts import get_security_prompt
from prompts.devops_prompts import get_devops_prompt
from prompts.analytics_prompts import get_analytics_prompt
from prompts.architect_prompts import get_architect_prompt

__all__ = [
    'get_designer_prompt', 'get_backend_prompt', 'get_frontend_prompt',
    'get_qa_prompt', 'get_security_prompt', 'get_devops_prompt',
    'get_analytics_prompt', 'get_architect_prompt',
]
