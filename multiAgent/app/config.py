"""
Multi-Agent System Configuration Management

This module provides centralized configuration for the multi-agent reasoning system,
including agent selection strategies, timeout settings, and quality thresholds.
"""

import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
from dotenv import load_dotenv

load_dotenv()

class AgentSelectionStrategy(Enum):
    """Strategies for selecting agents for different task types"""
    FIXED = "fixed"  # Use predefined agent assignments
    ROUND_ROBIN = "round_robin"  # Rotate between available agents
    LOAD_BALANCED = "load_balanced"  # Select based on current load
    PERFORMANCE_BASED = "performance_based"  # Select based on historical performance

@dataclass
class AgentConfig:
    """Configuration for individual agents"""
    name: str
    strengths: List[str]
    cost_per_token: float
    max_tokens_per_request: int
    rate_limit_rpm: int  # Requests per minute
    timeout_seconds: int
    retry_attempts: int
    retry_delay: float

@dataclass
class TaskTypeConfig:
    """Configuration for specific task types"""
    name: str
    preferred_agents: List[str]
    fallback_agents: List[str]
    timeout_seconds: int
    max_retries: int
    confidence_threshold: float
    priority_weight: float

@dataclass
class QualityConfig:
    """Configuration for quality control and validation"""
    confidence_threshold: float = 0.6
    contradiction_detection_enabled: bool = True
    hallucination_detection_enabled: bool = True
    response_verification_enabled: bool = True
    min_response_length: int = 50
    max_response_length: int = 10000

@dataclass
class PerformanceConfig:
    """Configuration for performance optimization"""
    max_concurrent_tasks: int = 5
    task_timeout_buffer: float = 1.2  # Multiply timeout by this factor
    memory_context_limit: int = 5000  # Max characters from memory context
    enable_caching: bool = True
    cache_ttl_seconds: int = 3600

class MultiAgentConfig:
    """Centralized configuration for the multi-agent system"""
    
    def __init__(self):
        self.load_from_environment()
        self.setup_default_configs()
    
    def load_from_environment(self):
        """Load configuration from environment variables"""
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.xai_grok_api_key = os.getenv("XAI_GROK_API_KEY")
        self.database_url = os.getenv("DATABASE_URL")
        
        # Performance settings from environment
        self.max_concurrent_tasks = int(os.getenv("MAX_CONCURRENT_TASKS", "5"))
        self.default_timeout = int(os.getenv("DEFAULT_TASK_TIMEOUT", "30"))
        self.confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", "0.6"))
        
        # Feature flags
        self.enable_contradiction_detection = os.getenv("ENABLE_CONTRADICTION_DETECTION", "true").lower() == "true"
        self.enable_hallucination_detection = os.getenv("ENABLE_HALLUCINATION_DETECTION", "true").lower() == "true"
        self.enable_response_verification = os.getenv("ENABLE_RESPONSE_VERIFICATION", "false").lower() == "true"
    
    def setup_default_configs(self):
        """Setup default configurations for agents and task types"""
        
        # Agent configurations
        self.agents = {
            "gpt4": AgentConfig(
                name="GPT-4",
                strengths=["creative_reasoning", "code_generation", "explanation"],
                cost_per_token=0.03,
                max_tokens_per_request=4000,
                rate_limit_rpm=60,
                timeout_seconds=30,
                retry_attempts=2,
                retry_delay=1.0
            ),
            "claude": AgentConfig(
                name="Claude",
                strengths=["task_breakdown", "synthesis", "analysis"],
                cost_per_token=0.025,
                max_tokens_per_request=8000,
                rate_limit_rpm=50,
                timeout_seconds=45,
                retry_attempts=2,
                retry_delay=1.5
            ),
            "grok": AgentConfig(
                name="Grok",
                strengths=["fact_checking", "real_time_info", "verification"],
                cost_per_token=0.01,
                max_tokens_per_request=2000,
                rate_limit_rpm=100,
                timeout_seconds=25,
                retry_attempts=3,
                retry_delay=0.5
            )
        }
        
        # Task type configurations
        self.task_types = {
            "task_breakdown": TaskTypeConfig(
                name="task_breakdown",
                preferred_agents=["claude"],
                fallback_agents=["gpt4"],
                timeout_seconds=45,
                max_retries=2,
                confidence_threshold=0.7,
                priority_weight=1.0
            ),
            "explanation": TaskTypeConfig(
                name="explanation",
                preferred_agents=["gpt4"],
                fallback_agents=["claude"],
                timeout_seconds=30,
                max_retries=2,
                confidence_threshold=0.6,
                priority_weight=0.8
            ),
            "fact_check": TaskTypeConfig(
                name="fact_check",
                preferred_agents=["grok"],
                fallback_agents=["claude", "gpt4"],
                timeout_seconds=30,
                max_retries=3,
                confidence_threshold=0.8,
                priority_weight=0.9
            ),
            "code_generation": TaskTypeConfig(
                name="code_generation",
                preferred_agents=["gpt4"],
                fallback_agents=["claude"],
                timeout_seconds=40,
                max_retries=2,
                confidence_threshold=0.7,
                priority_weight=0.6
            ),
            "final_synthesis": TaskTypeConfig(
                name="final_synthesis",
                preferred_agents=["claude"],
                fallback_agents=["gpt4"],
                timeout_seconds=45,
                max_retries=1,
                confidence_threshold=0.8,
                priority_weight=1.0
            )
        }
        
        # Quality control configuration
        self.quality = QualityConfig(
            confidence_threshold=self.confidence_threshold,
            contradiction_detection_enabled=self.enable_contradiction_detection,
            hallucination_detection_enabled=self.enable_hallucination_detection,
            response_verification_enabled=self.enable_response_verification
        )
        
        # Performance configuration
        self.performance = PerformanceConfig(
            max_concurrent_tasks=self.max_concurrent_tasks
        )
        
        # Agent selection strategy
        self.agent_selection_strategy = AgentSelectionStrategy.FIXED
    
    def get_agent_for_task(self, task_type: str, exclude_agents: List[str] = None) -> Optional[str]:
        """Get the best agent for a given task type"""
        exclude_agents = exclude_agents or []
        
        if task_type not in self.task_types:
            return "gpt4"  # Default fallback
        
        task_config = self.task_types[task_type]
        
        # Try preferred agents first
        for agent in task_config.preferred_agents:
            if agent not in exclude_agents and agent in self.agents:
                return agent
        
        # Try fallback agents
        for agent in task_config.fallback_agents:
            if agent not in exclude_agents and agent in self.agents:
                return agent
        
        return None
    
    def get_task_config(self, task_type: str) -> TaskTypeConfig:
        """Get configuration for a specific task type"""
        return self.task_types.get(task_type, self.task_types["explanation"])
    
    def get_agent_config(self, agent_name: str) -> AgentConfig:
        """Get configuration for a specific agent"""
        return self.agents.get(agent_name, self.agents["gpt4"])
    
    def update_config(self, section: str, key: str, value: Any):
        """Update a configuration value dynamically"""
        if section == "quality" and hasattr(self.quality, key):
            setattr(self.quality, key, value)
        elif section == "performance" and hasattr(self.performance, key):
            setattr(self.performance, key, value)
        elif section == "agents" and key in self.agents:
            # Allow updating specific agent properties
            pass  # Implementation would depend on specific needs
    
    def validate_config(self) -> List[str]:
        """Validate the current configuration and return any issues"""
        issues = []
        
        # Check API keys
        if not self.openai_api_key:
            issues.append("OPENAI_API_KEY not set")
        if not self.anthropic_api_key:
            issues.append("ANTHROPIC_API_KEY not set")
        if not self.xai_grok_api_key:
            issues.append("XAI_GROK_API_KEY not set")
        
        # Check database connection
        if not self.database_url:
            issues.append("DATABASE_URL not set")
        
        # Validate task type configurations
        for task_type, config in self.task_types.items():
            if not config.preferred_agents:
                issues.append(f"No preferred agents configured for task type: {task_type}")
        
        return issues

# Global configuration instance
config = MultiAgentConfig()
