import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
from app.utils import execute_tasks  # Import the execute_tasks function from utils

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

client = AsyncOpenAI(api_key=openai_api_key)

async def get_task_plan(prompt: str) -> list:
    task_count = 3
    if len(prompt.split()) > 50:
        task_count = 5
    if len(prompt.split()) > 100:
        task_count = 7

    planning_prompt = f"""
    You are a task planning agent for a collaborative AI system.

    Analyze the following prompt:
    \"\"\"{prompt}\"\"\"

    If the prompt contains an implicit or explicit directive (e.g., "compare and contrast X and Y", "analyze...", "summarize..."), convert it into one or more subtasks that fulfill the instruction.

    Break it into a list of approximately {task_count} subtasks. For each subtask, specify the following fields:
    - "task_name": A short title for the task.
    - "description": A concise explanation of what the task involves.
    - "agent": Assign one of "GPT-4", "Claude", or "Grok" to the task.
    - "task_type": Choose from: "research", "fact_check", "synthesis", "code", or "other".
    - "topic" (optional): If possible, provide a high-level topic (e.g., "algorithms", "data privacy", "education policy").

    Return your output as a JSON array of objects, one per task. Do not include any extra explanation.
    """

    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a precise planning agent."},
            {"role": "user", "content": planning_prompt}
        ],
    )

    # Expected to be JSON
    return response.choices[0].message.content