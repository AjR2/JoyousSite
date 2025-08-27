import asyncio
import time
import uuid
from typing import Optional
from app.db import async_session
from app.models.agent_action import AgentAction

import logging

logger = logging.getLogger(__name__)

class AgentLogger:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.conversation_id = str(uuid.uuid4())  # Generate unique conversation ID
        self.logger = logger
        
    def debug(self, message: str):
        self.logger.debug(f"[{self.user_id}] {message}")

    def info(self, message: str):
        self.logger.info(f"[{self.user_id}] {message}")

    def warning(self, message: str):
        self.logger.warning(f"[{self.user_id}] {message}")

    def error(self, message: str):
        self.logger.error(f"[{self.user_id}] {message}")
        
    async def log_agent_action(
        self,
        agent_name: str,
        task_type: str,
        prompt: str,
        response: Optional[str] = None,
        error: Optional[str] = None,
        duration: Optional[float] = None,
        status: str = "started"
    ):
        """Log an agent action to the database."""
        async with async_session() as session:
            try:
                action = AgentAction(
                    user_id=self.user_id,
                    conversation_id=self.conversation_id,
                    agent_name=agent_name,
                    task_type=task_type,
                    prompt=prompt,
                    response=response,
                    error=error,
                    duration=duration,
                    status=status
                )
                session.add(action)
                await session.commit()
                return action.id
            except Exception as e:
                print(f"Failed to log agent action: {e}")
                return None

    async def update_action(
        self,
        action_id: int,
        response: Optional[str] = None,
        error: Optional[str] = None,
        duration: Optional[float] = None,
        status: Optional[str] = None
    ):
        """Update an existing agent action log."""
        if action_id is None:
            return
            
        async with async_session() as session:
            try:
                action = await session.get(AgentAction, action_id)
                if action:
                    if response is not None:
                        action.response = response
                    if error is not None:
                        action.error = error
                    if duration is not None:
                        action.duration = duration
                    if status is not None:
                        action.status = status
                    await session.commit()
            except Exception as e:
                print(f"Failed to update agent action: {e}")

class AgentActionTracker:
    """Context manager for tracking agent actions."""
    def __init__(self, logger: AgentLogger, agent_name: str, task_type: str, prompt: str):
        self.logger = logger
        self.agent_name = agent_name
        self.task_type = task_type
        self.prompt = prompt
        self.start_time = None
        self.action_id = None

    async def __aenter__(self):
        self.start_time = time.time()
        self.action_id = await self.logger.log_agent_action(
            agent_name=self.agent_name,
            task_type=self.task_type,
            prompt=self.prompt,
            status="started"
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        if exc_type is None:
            # Normal completion
            await self.logger.update_action(
                self.action_id,
                duration=duration,
                status="completed"
            )
        else:
            # Error occurred
            error_msg = str(exc_val) if exc_val else "Unknown error"
            status = "timeout" if isinstance(exc_val, asyncio.TimeoutError) else "error"
            await self.logger.update_action(
                self.action_id,
                error=error_msg,
                duration=duration,
                status=status
            )
        return False  # Don't suppress exceptions

    async def update_response(self, response: str):
        """Update the action with a response."""
        await self.logger.update_action(
            self.action_id,
            response=response
        )
