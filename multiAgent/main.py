import json
import redis
import asyncpg
from fastapi import FastAPI, Request, HTTPException, Form, Query
from datetime import datetime, timezone
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from app.utils import call_agent_with_timeout, embed_text
from app.utils.agent_logger import AgentLogger
from app.db import async_session
from app.models import Memory
from app.llms import ask_gpt, ask_claude, ask_grok
from app.quality_control import quality_controller
from app.task_priority import TaskPriorityManager, Priority

import os
import logging

# Load environment variables
load_dotenv()

# Rate Limiting Setup (10 requests per minute per user)
limiter = Limiter(key_func=get_remote_address)
from app.utils.agent_analytics import AgentAnalytics
from app.debate import run_debate

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()
app.state.limiter = limiter

# Redis Cache Setup
redis_client = None

def get_redis_client():
    global redis_client
    try:
        if redis_client is None:
            redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
            # Test the connection
            redis_client.ping()
        return redis_client
    except redis.ConnectionError as e:
        print(f"Redis connection error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected Redis error: {e}")
        return None

def get_memory(user_id):
    try:
        cache = get_redis_client()
        if cache is None:
            return []
        history = cache.lrange(user_id, 0, -1)
        return [json.loads(item) for item in history]
    except redis.RedisError as e:
        print(f"Redis error in get_memory: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"JSON decode error in get_memory: {e}")
        return []

async def store_memory(user_id: str, prompt: str, response: str):
    # Store in vector database
    try:
        prompt_vec = await embed_text(prompt)
        response_vec = await embed_text(response)

        async with async_session() as session:
            session.add(Memory(
                user_id=user_id,
                prompt=prompt,
                response=response,
                prompt_embedding=prompt_vec,
                response_embedding=response_vec,
                timestamp=datetime.now(timezone.utc)
            ))
            await session.commit()
    except Exception as e:
        print(f"Error storing memory in database: {e}")

    # Store in Redis cache
    try:
        cache = get_redis_client()
        if cache is not None:
            memory_item = json.dumps({"prompt": prompt, "response": response})
            cache.lpush(user_id, memory_item)
            # Keep only last 50 items in cache
            cache.ltrim(user_id, 0, 49)
    except redis.RedisError as e:
        print(f"Error storing memory in Redis: {e}")
    except Exception as e:
        print(f"Unexpected error storing memory in Redis: {e}")

pool = None

async def init_db():
    global pool
    if pool is None:
        dsn = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
        print("Using DSN for asyncpg:", dsn)
        pool = await asyncpg.create_pool(dsn)
    return pool

async def get_long_term_memory(user_id):
    pool = await init_db()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT prompt, response FROM memory WHERE user_id=$1 ORDER BY timestamp DESC LIMIT 5",
            user_id
        )
        return [{"prompt": row["prompt"], "response": row["response"]} for row in rows]


# Missing functions: Let's define them here

# Define truncate_tokens function for token management
def truncate_tokens(text: str, max_tokens: int = 500):
    """Truncate tokens to the specified maximum length."""
    tokens = text.split()
    return " ".join(tokens[:max_tokens])

# Plan Tasks Function
def plan_tasks(prompt):
    """Function to break down tasks based on prompt complexity."""
    # Example task breakdown logic, you can enhance this
    tasks = [
        {"task_name": "Research Task", "agent": "GPT-4", "task_type": "research"},
        {"task_name": "Fact-check Task", "agent": "Grok", "task_type": "fact_check"},
        {"task_name": "Final Synthesis", "agent": "Claude", "task_type": "synthesis"}
    ]
    return tasks

# Execute Tasks Function
async def execute_tasks(prompt, context_summary):
    """Execute tasks based on the prompt and context summary."""
    try:
        task_outputs = {}

        # Example: Process tasks using AGENTS or relevant task handlers
        tasks = plan_tasks(prompt)
        for task in tasks:
            task_input = f"Task: {task['task_name']}\nContext: {context_summary}\nPrompt: {prompt}"
            agent_function = AGENT_REGISTRY.get(task["agent"])
            if agent_function:
                response = await agent_function(task_input)
                task_outputs[task["task_name"]] = response

        return task_outputs, context_summary
    except Exception as e:
        raise Exception(f"Error in executing tasks: {str(e)}")

# Agent registry for task types
AGENT_REGISTRY = {
    "task_breakdown": ask_claude,
    "explanation": ask_gpt,
    "fact_check": ask_grok,
    "coding": ask_gpt,
    "final_refinement": ask_claude
}

async def multi_agent_reasoning(prompt, user_id, task_type="general"):
    logger.debug(f"Starting multi_agent_reasoning with prompt: {prompt[:50]}...")
    # Create a logger for this conversation
    logger.debug("Creating AgentLogger")
    agent_logger = AgentLogger(user_id)
    
    # Create task priority manager
    logger.debug("Creating TaskPriorityManager")
    task_manager = TaskPriorityManager(user_id, agent_logger)
    # Retrieve memory context with fallback to long-term storage
    try:
        memory = get_memory(user_id)
        memory_context = str(memory) if memory else "No relevant memory found."
    except Exception as e:
        print(f"Error getting memory context: {e}")
        memory_context = "No relevant memory found."

    # Define tasks with priorities and dependencies
    task_manager.add_task(
        name="task_analysis",
        agent_func=ask_claude,
        prompt=f"Using context:\n{memory_context}\n\nBreak down the steps for: {prompt}",
        priority=Priority.CRITICAL,  # Task analysis is critical as other tasks depend on it
        timeout=45,
        task_type='task_breakdown',
        weight=1.0
    )

    task_manager.add_task(
        name="initial_explanation",
        agent_func=ask_gpt,
        prompt=f"Using context:\n{memory_context}\n\nExplain in detail: {prompt}",
        priority=Priority.HIGH,
        timeout=30,
        task_type='explanation',
        weight=0.9
    )

    task_manager.add_task(
        name="fact_check",
        agent_func=ask_grok,
        prompt=f"Verify these facts:\n{prompt}",
        priority=Priority.HIGH,
        timeout=30,
        task_type='fact_check',
        dependencies=["task_analysis", "initial_explanation"],
        weight=0.8
    )

    task_manager.add_task(
        name="refined_explanation",
        agent_func=ask_gpt,
        prompt=f"Using the fact check, refine this explanation:\n{prompt}",
        priority=Priority.MEDIUM,
        timeout=30,
        task_type='explanation',
        dependencies=["initial_explanation", "fact_check"],
        weight=0.7
    )

    task_manager.add_task(
        name="code_example",
        agent_func=ask_gpt,
        prompt=f"Provide a Python example for: {prompt}",
        priority=Priority.LOW,  # Code examples are helpful but not critical
        timeout=30,
        task_type='code_generation',
        dependencies=["task_analysis"],
        weight=0.6
    )

    task_manager.add_task(
        name="final_synthesis",
        agent_func=ask_claude,
        prompt="""Using:
        - Memory: {memory_context}
        - Task Breakdown: {task_analysis}
        - Explanation: {refined_explanation}
        - Code Example: {code_example}
        - Fact Check: {fact_check}
        Create a final polished response.
        """,
        priority=Priority.HIGH,
        timeout=45,
        task_type='final_synthesis',
        dependencies=["task_analysis", "refined_explanation", "code_example", "fact_check"],
        weight=1.0
    )

    # Execute all tasks respecting priorities and dependencies
    logger.debug("Starting task execution")
    results = await task_manager.execute_all()
    logger.debug(f"Task execution completed with {len(results)} results")
    
    # Enhanced quality assessment of each response
    quality_assessments = {}
    low_confidence_tasks = []
    CONFIDENCE_THRESHOLD = 0.6  # Threshold for considering a response low-confidence

    for task_name, response in results.items():
        if not response or response == 'Failed':
            quality_assessments[task_name] = {
                'confidence_score': 0.0,
                'quality_metrics': None
            }
            continue

        # Map task_name to task_type for quality assessment
        task_type_mapping = {
            'task_analysis': 'task_breakdown',
            'initial_explanation': 'explanation',
            'refined_explanation': 'explanation',
            'fact_check': 'fact_check',
            'code_example': 'code_generation',
            'final_synthesis': 'final_synthesis'
        }
        task_type = task_type_mapping.get(task_name, 'explanation')

        # Perform comprehensive quality assessment
        quality_metrics = await quality_controller.comprehensive_quality_assessment(
            response, task_type, prompt, memory_context
        )

        quality_assessments[task_name] = {
            'confidence_score': quality_metrics.confidence_score,
            'quality_metrics': quality_metrics
        }

        # Check if confidence is below threshold
        if quality_metrics.confidence_score < CONFIDENCE_THRESHOLD:
            low_confidence_tasks.append((task_name, quality_metrics.confidence_score))
            logger.debug(f"Low confidence detected for {task_name}: {quality_metrics.confidence_score}")
    
    # Re-route low-confidence responses if needed
    if low_confidence_tasks:
        logger.debug(f"Re-routing {len(low_confidence_tasks)} low-confidence tasks")
        
        # Sort by confidence (lowest first)
        low_confidence_tasks.sort(key=lambda x: x[1])
        
        for task_name, score in low_confidence_tasks:
            # Skip final_synthesis as it will be regenerated anyway
            if task_name == 'final_synthesis':
                continue
                
            # Determine which agent to use for re-synthesis
            # For critical tasks with very low confidence, use Claude
            if score < 0.4 or task_name in ['task_analysis', 'fact_check']:
                retry_agent = ask_claude
            else:
                # For less critical tasks, use GPT
                retry_agent = ask_gpt
            
            # Create a more detailed prompt for the retry
            retry_prompt = f"""The previous response for this task had low confidence ({score:.2f}).
            Please provide a more detailed and confident response.
            
            Original task: {prompt}
            Previous response: {results[task_name]}
            
            Please provide a more thorough and confident response:"""
            
            # Execute the retry
            logger.debug(f"Retrying {task_name} with {retry_agent.__name__}")
            retry_result = await call_agent_with_timeout(
                retry_agent, 
                retry_prompt,
                timeout=45,  # Longer timeout for retries
                user_id=user_id,
                task_type=f"retry_{task_name}",
                logger=agent_logger
            )
            
            # If retry succeeded, assess its quality
            retry_quality = await quality_controller.comprehensive_quality_assessment(
                retry_result, task_name, retry_prompt
            )

            if retry_quality.confidence_score > score:
                logger.debug(f"Retry for {task_name} succeeded with higher confidence: {retry_quality.confidence_score:.2f} > {score:.2f}")
                results[task_name] = retry_result
                quality_assessments[task_name] = {
                    'confidence_score': retry_quality.confidence_score,
                    'quality_metrics': retry_quality
                }
            else:
                logger.debug(f"Retry for {task_name} did not improve confidence: {retry_quality.confidence_score:.2f} <= {score:.2f}")

    # Extract confidence scores for backward compatibility
    confidence_scores = {name: assessment['confidence_score']
                        for name, assessment in quality_assessments.items()}
    results['confidence_scores'] = confidence_scores

    # Enhanced contradiction detection between agent outputs
    agent_outputs = {
        'Task Breakdown': results.get('task_analysis', ''),
        'Initial Explanation': results.get('initial_explanation', ''),
        'Refined Explanation': results.get('refined_explanation', ''),
        'Fact Check': results.get('fact_check', ''),
        'Code Example': results.get('code_example', '')
    }

    # Filter out empty outputs
    agent_outputs = {k: v for k, v in agent_outputs.items() if v and v != 'Failed'}

    contradiction_report = await quality_controller.enhanced_contradiction_detection(agent_outputs)
    claude_resolution = contradiction_report.resolution_suggestion

    # Store memory and return the results
    try:
        await store_memory(user_id, prompt, results.get('final_synthesis', ''))
    except Exception as e:
        print(f"Error storing memory: {e}")

    # Hallucination detection on the final response
    from app.utils import detect_hallucinated_citations
    hallucination_report = []
    final_response = results.get('final_synthesis', 'Failed')
    try:
        hallucination_report = await detect_hallucinated_citations(final_response)
    except Exception as e:
        hallucination_report = [{'error': str(e)}]

    # Extract confidence scores and quality metrics for reporting
    confidence_data = results.get('confidence_scores', {})

    # Get task execution summary from task manager
    execution_summary = task_manager.get_execution_summary()

    return {
        "Task Breakdown": results.get('task_analysis', 'Failed'),
        "Initial Explanation": results.get('initial_explanation', 'Failed'),
        "Refined Explanation": results.get('refined_explanation', 'Failed'),
        "Code Example": results.get('code_example', 'No code example needed'),
        "Fact Check": results.get('fact_check', 'Failed'),
        "Final Response": final_response,
        "Hallucination Report": hallucination_report,
        "Contradiction Report": {
            "contradictions_found": contradiction_report.contradictions_found,
            "severity_level": contradiction_report.severity_level,
            "confidence_in_detection": contradiction_report.confidence_in_detection
        },
        "Claude Resolution": claude_resolution,
        "Confidence Scores": confidence_data,
        "Quality Assessments": {name: {
            "confidence_score": assessment['confidence_score'],
            "coherence_score": assessment['quality_metrics'].coherence_score if assessment['quality_metrics'] else 0.0,
            "completeness_score": assessment['quality_metrics'].completeness_score if assessment['quality_metrics'] else 0.0,
            "content_flags": assessment['quality_metrics'].content_flags if assessment['quality_metrics'] else []
        } for name, assessment in quality_assessments.items()},
        "Execution Summary": execution_summary,
        "Low Confidence Tasks": [task for task, score in confidence_data.items()
                              if score < 0.6 and task != 'confidence_scores']
    }

@app.post("/ask")
@limiter.limit("10/minute")
async def ask_ai(request: Request):
    logger.debug("Received /ask request")
    try:
        data = await request.json()
        prompt = data.get("prompt")
        task_type = data.get("task_type")
        user_id = data.get("user_id", "default_user")

        if not prompt or not task_type:
            raise HTTPException(status_code=400, detail="Missing 'prompt' or 'task_type'.")

        if task_type not in AGENT_REGISTRY:
            raise HTTPException(status_code=400, detail="Invalid task_type provided.")

        response = await multi_agent_reasoning(prompt, user_id, task_type)
        return JSONResponse(content=response)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/collaborate")
@limiter.limit("10/minute")
async def collaborate(
    request: Request,
    prompt: str = Form(...),
    user_id: str = Form(...)
):
    """Endpoint for multi-agent collaboration."""
    try:
        response = await multi_agent_reasoning(prompt, user_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/conversation/{conversation_id}")
async def get_conversation_analytics(conversation_id: str):
    """Get analytics for a specific conversation."""
    return await AgentAnalytics.get_conversation_summary(conversation_id)

@app.get("/analytics/performance")
async def get_performance_metrics(
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    user_id: Optional[str] = Query(None)
):
    """Get performance metrics for all agents."""
    return await AgentAnalytics.get_agent_performance_metrics(
        start_time=start_time,
        end_time=end_time,
        user_id=user_id
    )

@app.get("/analytics/tasks")
async def get_task_distribution(
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    user_id: Optional[str] = Query(None)
):
    """Get distribution of task types and their success rates."""
    return await AgentAnalytics.get_task_type_distribution(
        start_time=start_time,
        end_time=end_time,
        user_id=user_id
    )

@app.get("/analytics/errors")
async def get_error_patterns(
    limit: int = Query(10, ge=1, le=100),
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None)
):
    """Get most common error patterns."""
    return await AgentAnalytics.get_common_errors(
        limit=limit,
        start_time=start_time,
        end_time=end_time
    )