from enum import Enum
from typing import Dict, List, Optional, Tuple, Set
import asyncio
import time
from dataclasses import dataclass, field
from app.utils import call_agent_with_timeout
from app.utils.agent_logger import AgentLogger
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Priority(Enum):
    CRITICAL = 4    # Must-have tasks (e.g., security checks)
    HIGH = 3        # Important tasks (e.g., task breakdown)
    MEDIUM = 2      # Standard tasks (e.g., explanations)
    LOW = 1         # Nice-to-have tasks (e.g., additional examples)

    def __lt__(self, other):
        if self.__class__ is other.__class__:
            return self.value < other.value
        return NotImplemented

@dataclass
class TaskResult:
    """Enhanced task result with metadata"""
    task_name: str
    result: str
    success: bool
    execution_time: float
    retry_count: int = 0
    error_message: Optional[str] = None

@dataclass
class Task:
    name: str
    agent_func: callable
    prompt: str
    priority: Priority
    timeout: int
    task_type: str
    dependencies: List[str] = field(default_factory=list)  # Names of tasks this one depends on
    weight: float = 1.0  # Importance weight within its priority level
    max_retries: int = 2  # Maximum number of retries for failed tasks
    retry_delay: float = 1.0  # Delay between retries in seconds
    created_at: float = field(default_factory=time.time)

class TaskPriorityManager:
    def __init__(self, user_id: str, agent_logger: Optional[AgentLogger] = None):
        logger.debug(f"Initializing TaskPriorityManager for user {user_id}")
        self.user_id = user_id
        self.agent_logger = agent_logger
        self.tasks: Dict[str, Task] = {}
        self.results: Dict[str, TaskResult] = {}
        self.completed_tasks: Set[str] = set()
        self.failed_tasks: Set[str] = set()
        self.execution_stats = {
            'total_tasks': 0,
            'successful_tasks': 0,
            'failed_tasks': 0,
            'total_execution_time': 0.0,
            'retries_performed': 0
        }

    def add_task(
        self,
        name: str,
        agent_func: callable,
        prompt: str,
        priority: Priority,
        timeout: int,
        task_type: str,
        dependencies: List[str] = None,
        weight: float = 1.0,
        max_retries: int = 2,
        retry_delay: float = 1.0
    ):
        """Add a task to the manager with enhanced configuration."""
        if name in self.tasks:
            logger.warning(f"Task {name} already exists, overwriting")

        # Validate dependencies
        if dependencies:
            invalid_deps = [dep for dep in dependencies if dep not in self.tasks and dep != name]
            if invalid_deps:
                logger.warning(f"Task {name} has invalid dependencies: {invalid_deps}")

        logger.debug(f"Adding task: {name} with priority {priority} and dependencies {dependencies}")
        self.tasks[name] = Task(
            name=name,
            agent_func=agent_func,
            prompt=prompt,
            priority=priority,
            timeout=timeout,
            task_type=task_type,
            dependencies=dependencies or [],
            weight=weight,
            max_retries=max_retries,
            retry_delay=retry_delay
        )
        self.execution_stats['total_tasks'] += 1
    
    def get_ready_tasks(self) -> List[Tuple[str, Task]]:
        """Get tasks whose dependencies are satisfied, ordered by priority and weight."""
        ready_tasks = []

        for name, task in self.tasks.items():
            # Skip completed or failed tasks
            if name in self.completed_tasks or name in self.failed_tasks:
                continue

            # Check if all dependencies are met (completed successfully)
            dependencies_met = all(
                dep in self.completed_tasks for dep in task.dependencies
            )

            # Check if any dependencies failed
            dependencies_failed = any(
                dep in self.failed_tasks for dep in task.dependencies
            )

            if dependencies_met and not dependencies_failed:
                ready_tasks.append((name, task))
            elif dependencies_failed:
                logger.warning(f"Task {name} cannot execute due to failed dependencies")
                self.failed_tasks.add(name)

        # Sort by priority (highest first), then by weight (highest first), then by creation time
        return sorted(
            ready_tasks,
            key=lambda x: (x[1].priority.value, x[1].weight, -x[1].created_at),
            reverse=True
        )
    
    async def execute_task(self, name: str, task: Task, retry_count: int = 0) -> TaskResult:
        """Execute a single task with retry logic and enhanced error handling."""
        start_time = time.time()
        logger.debug(f"Executing task: {name} (attempt {retry_count + 1}/{task.max_retries + 1}) with priority {task.priority}")

        try:
            # Format prompt with results from dependencies if needed
            logger.debug(f"Formatting prompt for task {name} with dependencies: {task.dependencies}")
            formatted_prompt = task.prompt
            for dep in task.dependencies:
                if dep in self.results and self.results[dep].success:
                    # Replace dependency placeholders with actual results
                    formatted_prompt = formatted_prompt.replace(
                        f"{{{dep}}}",
                        self.results[dep].result
                    )

            # Execute the task with timeout
            logger.debug(f"Calling agent for task {name}")
            result = await call_agent_with_timeout(
                task.agent_func,
                formatted_prompt,
                timeout=task.timeout,
                user_id=self.user_id,
                task_type=task.task_type,
                logger=self.agent_logger
            )

            execution_time = time.time() - start_time
            logger.debug(f"Task {name} completed successfully in {execution_time:.2f}s with result length: {len(str(result))}")

            # Create successful task result
            task_result = TaskResult(
                task_name=name,
                result=result,
                success=True,
                execution_time=execution_time,
                retry_count=retry_count
            )

            self.results[name] = task_result
            self.completed_tasks.add(name)
            self.execution_stats['successful_tasks'] += 1
            self.execution_stats['total_execution_time'] += execution_time

            return task_result

        except Exception as e:
            execution_time = time.time() - start_time
            error_msg = str(e)
            logger.error(f"Task {name} failed (attempt {retry_count + 1}): {error_msg}")

            # Check if we should retry
            if retry_count < task.max_retries:
                logger.info(f"Retrying task {name} in {task.retry_delay}s...")
                await asyncio.sleep(task.retry_delay)
                self.execution_stats['retries_performed'] += 1
                return await self.execute_task(name, task, retry_count + 1)

            # All retries exhausted, mark as failed
            logger.error(f"Task {name} failed permanently after {retry_count + 1} attempts")

            task_result = TaskResult(
                task_name=name,
                result="",
                success=False,
                execution_time=execution_time,
                retry_count=retry_count,
                error_message=error_msg
            )

            self.results[name] = task_result
            self.failed_tasks.add(name)
            self.execution_stats['failed_tasks'] += 1
            self.execution_stats['total_execution_time'] += execution_time

            return task_result
    
    async def execute_ready_tasks(self) -> List[TaskResult]:
        """Execute all ready tasks in priority order with improved concurrency control."""
        logger.debug("Checking for ready tasks...")
        ready_tasks = self.get_ready_tasks()
        logger.debug(f"Found {len(ready_tasks)} ready tasks")

        if not ready_tasks:
            return []

        # Group tasks by priority for concurrent execution within priority levels
        priority_groups: Dict[Priority, List[Tuple[str, Task]]] = {}
        for name, task in ready_tasks:
            if task.priority not in priority_groups:
                priority_groups[task.priority] = []
            priority_groups[task.priority].append((name, task))

        all_results = []

        # Execute tasks priority by priority (highest first)
        for priority in sorted(priority_groups.keys(), reverse=True):
            tasks = priority_groups[priority]
            logger.debug(f"Executing {len(tasks)} tasks at priority {priority.name}")

            # Execute tasks within the same priority level concurrently
            # but with a reasonable concurrency limit to avoid overwhelming the system
            max_concurrent = min(len(tasks), 5)  # Limit concurrent tasks

            if max_concurrent == len(tasks):
                # Execute all tasks concurrently
                tasks_to_run = [
                    self.execute_task(name, task)
                    for name, task in tasks
                ]
                priority_results = await asyncio.gather(*tasks_to_run, return_exceptions=True)
            else:
                # Execute in batches
                priority_results = []
                for i in range(0, len(tasks), max_concurrent):
                    batch = tasks[i:i + max_concurrent]
                    batch_tasks = [
                        self.execute_task(name, task)
                        for name, task in batch
                    ]
                    batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                    priority_results.extend(batch_results)

            # Process results and handle exceptions
            for i, result in enumerate(priority_results):
                if isinstance(result, Exception):
                    task_name = tasks[i][0]
                    logger.error(f"Unexpected error in task {task_name}: {result}")
                    # Create a failed task result
                    failed_result = TaskResult(
                        task_name=task_name,
                        result="",
                        success=False,
                        execution_time=0.0,
                        retry_count=0,
                        error_message=str(result)
                    )
                    self.results[task_name] = failed_result
                    self.failed_tasks.add(task_name)
                    all_results.append(failed_result)
                else:
                    all_results.append(result)

        return all_results
    
    async def execute_all(self) -> Dict[str, str]:
        """Execute all tasks respecting priorities and dependencies."""
        logger.debug("Starting execution of all tasks")
        start_time = time.time()

        max_iterations = len(self.tasks) * 2  # Prevent infinite loops
        iteration = 0

        while (len(self.completed_tasks) + len(self.failed_tasks)) < len(self.tasks) and iteration < max_iterations:
            iteration += 1
            logger.debug(f"Execution iteration {iteration}: {len(self.completed_tasks)} completed, {len(self.failed_tasks)} failed, {len(self.tasks)} total")

            results = await self.execute_ready_tasks()
            if not results:
                # No tasks were ready - check if we have circular dependencies
                remaining_tasks = set(self.tasks.keys()) - self.completed_tasks - self.failed_tasks
                if remaining_tasks:
                    logger.warning(f"No ready tasks found but {len(remaining_tasks)} tasks remain: {remaining_tasks}")
                    # Mark remaining tasks as failed due to unresolvable dependencies
                    for task_name in remaining_tasks:
                        failed_result = TaskResult(
                            task_name=task_name,
                            result="",
                            success=False,
                            execution_time=0.0,
                            retry_count=0,
                            error_message="Unresolvable dependencies or circular dependency detected"
                        )
                        self.results[task_name] = failed_result
                        self.failed_tasks.add(task_name)
                        self.execution_stats['failed_tasks'] += 1
                break

        total_time = time.time() - start_time
        logger.info(f"Task execution completed in {total_time:.2f}s: {len(self.completed_tasks)} successful, {len(self.failed_tasks)} failed")

        # Return results in the expected format for backward compatibility
        return {name: result.result for name, result in self.results.items() if result.success}

    def get_execution_summary(self) -> Dict:
        """Get a summary of task execution statistics."""
        return {
            **self.execution_stats,
            'completion_rate': self.execution_stats['successful_tasks'] / max(self.execution_stats['total_tasks'], 1),
            'average_execution_time': self.execution_stats['total_execution_time'] / max(self.execution_stats['successful_tasks'], 1),
            'completed_tasks': list(self.completed_tasks),
            'failed_tasks': list(self.failed_tasks)
        }

    def get_task_results(self) -> Dict[str, TaskResult]:
        """Get detailed results for all tasks."""
        return self.results.copy()

    def has_failed_critical_tasks(self) -> bool:
        """Check if any critical priority tasks have failed."""
        for task_name in self.failed_tasks:
            if task_name in self.tasks and self.tasks[task_name].priority == Priority.CRITICAL:
                return True
        return False
