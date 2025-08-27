from fastapi import APIRouter, Form
import asyncio
from app.llms import call_gpt4, call_claude, call_grok
from app.memory import recall_memory, store_memory
from app.utils import truncate_tokens, execute_tasks, verify_final_response, AGENTS
import random
from typing import List, Dict, Tuple, Callable
from app.planner import get_task_plan

# Define AGENTS with the correct strengths and cost mappings.
AGENTS = {
    "gpt4": {"fn": call_gpt4, "strength": "creative reasoning", "cost": 0.03},
    "grok": {"fn": call_grok, "strength": "fact checking", "cost": 0.01},
    "claude": {"fn": call_claude, "strength": "synthesis", "cost": 0.025}
}

# Choose agent based on task type.
def choose_agent(task_type: str):
    if task_type == "fact_check":
        return AGENTS["grok"]["fn"]
    elif task_type == "synthesis":
        return AGENTS["claude"]["fn"]
    elif task_type == "research":
        choices = [
            (AGENTS["gpt4"]["fn"], 0.7),
            (AGENTS["claude"]["fn"], 0.2),
            (AGENTS["grok"]["fn"], 0.1)
        ]
        functions, weights = zip(*choices)
        return random.choices(functions, weights=weights, k=1)[0]
    else:
        return AGENTS["gpt4"]["fn"]

router = APIRouter()

# Route for the collaboration endpoint
@router.post("/collaborate")
async def collaborate(
    prompt: str = Form(...),
    user_id: str = Form("default_user")
):
    try:
        # Recall past context and memory
        prior_knowledge = await recall_memory(user_id, prompt)
        
        context_summary = "\n\n".join([
            f"🧠 Memory #{i+1}\nQ: {item['prompt']}\nA: {truncate_tokens(item['response'])}"
            for i, item in enumerate(prior_knowledge)
        ])

        # Break the task into specific sub-tasks
        task_plan = await plan_tasks(prompt, context_summary)

        # Distribute tasks to the relevant agents based on task type
        task_outputs, task_context = await execute_tasks(prompt, context_summary)

        # Generate the final response based on the synthesized data
        final_response = await synthesize_response(prompt, context_summary, task_outputs)

        # Verify the quality of the final response
        verification_result = await verify_final_response(prompt, final_response, task_outputs)
        
        # Only store memory if the response quality meets a minimum threshold
        if verification_result["score"] >= 0.7:
            await store_memory(user_id, prompt, final_response)
        
        response = {
            "Task Plan": task_plan,
            **task_outputs,
            "Final": final_response,
        }
        response["Verification"] = verification_result
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Plan tasks based on the given context and prompt
async def plan_tasks(prompt: str, context: str) -> str:
    return await call_gpt4(
        f"""
        Based on this question: "{prompt}"
        And this context: "{context if context else 'None'}"

        Break it into specific tasks for:
        - Research (GPT-4)
        - Fact-check (Grok)
        - Final synthesis (Claude)

        Return a task list in bullet format.
        """
    )

# Function to distribute tasks across multiple agents
async def distribute_tasks(prompt: str, context: str) -> Dict[str, Tuple[str, Callable]]:
    tasks = {
        "ResearchAgent": (f"Answer this question with rich detail: {prompt}", AGENTS["gpt4"]["fn"]),
        "FactCheckAgent": (f"Double-check the explanation and ensure accuracy: {prompt}", AGENTS["grok"]["fn"]),
        "AlternatePerspectiveAgent": (f"Offer an alternative synthesis or challenge to the explanation: {prompt}", AGENTS["claude"]["fn"])
    }
    return tasks

# Execute tasks for each agent and manage context
async def execute_tasks(prompt: str, context: str) -> Tuple[Dict[str, str], Dict[str, str]]:
    distributed = await distribute_tasks(prompt, context)
    task_context = {}

    results = {}
    for role, (msg, fn) in distributed.items():
        enriched_msg = f"{msg}\n\nShared Context:\n{task_context}"
        result = await fn(enriched_msg)
        results[role] = result
        task_context[role] = result

    return results, task_context

# Synthesize the final response using agent outputs
async def synthesize_response(prompt: str, context: str, outputs: Dict[str, str]) -> str:
    synthesis_agent = choose_agent("synthesis")
    parts = "\n".join([
        f"### Role: {role}\n\n{resp}" for role, resp in outputs.items()
    ])
    return await synthesis_agent(f"""
    Final Synthesis Required

    Prompt: {prompt}

    Context (Prior Memory): {context}

    Agent Contributions:
    {parts}

    Please write a final cohesive response, integrating relevant reasoning from each agent. Highlight agreement, contradiction, and uncertainty if present.
    """)