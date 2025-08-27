# app/llms.py
from app.claude import call_claude
from app.gpt import call_gpt4
from app.grok import call_grok

# Centralized LLM access for agent collaboration

async def ask_gpt(prompt: str) -> str:
    return await call_gpt4(prompt)

async def ask_claude(prompt: str) -> str:
    return await call_claude(prompt)

async def ask_grok(prompt: str) -> str:
    return await call_grok(prompt)
