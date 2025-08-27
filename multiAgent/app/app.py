import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agent_registry import list_agents, add_agent
import uuid
from datetime import datetime
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import LLM functions directly
from app.gpt import call_gpt4
from app.claude import call_claude
from app.grok import call_grok

app = FastAPI()

# Pydantic models
class MessageData(BaseModel):
    message: str
    agent_id: str = "nimbus"
    conversation_id: str = None

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Healthcare endpoints removed - healthcare module is now independent

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "multiagent-api"}

@app.get("/agents")
def get_agents():
    return list_agents()

@app.post("/agents")
def create_agent(agent: dict):
    try:
        new_agent = add_agent(agent)
        return {"success": True, "agent": new_agent}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.put("/agents/{agent_id}")
def update_agent(agent_id: str, agent: dict):
    try:
        # For now, we'll use the same add_agent function which should handle updates
        # In a real implementation, you'd have a separate update function
        updated_agent = add_agent({**agent, "agent_id": agent_id})
        return {"success": True, "agent": updated_agent}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/agents/{agent_id}")
def delete_agent(agent_id: str):
    try:
        # For now, return success (implement actual deletion in agent_registry if needed)
        return {"success": True, "message": f"Agent {agent_id} deleted"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/conversations")
def start_conversation():
    conversation_id = str(uuid.uuid4())
    return {"conversation_id": conversation_id}

async def simple_multi_agent_reasoning(prompt: str):
    """Simplified multi-agent reasoning using the three available LLMs"""
    try:
        # Run all three agents in parallel for different perspectives
        tasks = [
            call_gpt4(f"As a creative reasoning expert, provide a comprehensive response to: {prompt}"),
            call_claude(f"As an analytical synthesis expert, provide a thoughtful response to: {prompt}"),
            call_grok(f"As a fact-checking expert, provide an accurate response to: {prompt}")
        ]

        # Wait for all agents to complete
        gpt_response, claude_response, grok_response = await asyncio.gather(*tasks, return_exceptions=True)

        # Handle any exceptions
        if isinstance(gpt_response, Exception):
            gpt_response = f"GPT-4 error: {str(gpt_response)}"
        if isinstance(claude_response, Exception):
            claude_response = f"Claude error: {str(claude_response)}"
        if isinstance(grok_response, Exception):
            grok_response = f"Grok error: {str(grok_response)}"

        # Use Claude to synthesize the final response
        synthesis_prompt = f"""
        You are Nimbus AI, an intelligent assistant that uses multiple AI agents working together to provide comprehensive responses.

        Based on the following responses from your internal AI agents, provide a comprehensive and well-reasoned final answer as Nimbus:

        GPT-4 (Creative Reasoning): {gpt_response}

        Claude (Analytical): {claude_response}

        Grok (Fact-Checking): {grok_response}

        Original Question: {prompt}

        Please synthesize these perspectives into a coherent, helpful response that addresses the user's question. Present the response as Nimbus AI, acknowledging that you use multiple AI agents behind the scenes to provide the best possible answer.
        """

        final_response = await call_claude(synthesis_prompt)

        return {
            "final_response": final_response,
            "agent_responses": {
                "gpt4": gpt_response,
                "claude": claude_response,
                "grok": grok_response
            }
        }
    except Exception as e:
        return {
            "final_response": f"I apologize, but I encountered an error processing your request: {str(e)}",
            "agent_responses": {},
            "error": str(e)
        }

@app.post("/chat")
async def send_message(message_data: MessageData):
    """Chat endpoint using simplified multi-agent reasoning"""
    try:
        conversation_id = message_data.conversation_id or str(uuid.uuid4())

        # Use simplified multi-agent reasoning
        multi_agent_result = await simple_multi_agent_reasoning(message_data.message)

        response = {
            "message": multi_agent_result["final_response"],
            "agent_id": message_data.agent_id,
            "conversation_id": conversation_id,
            "timestamp": datetime.now().isoformat(),
            "mock": False,
            "multi_agent_details": multi_agent_result  # Include full details for debugging
        }

        return response
    except Exception as e:
        return {"error": str(e), "success": False}

if __name__ == "__main__":
    uvicorn.run("app.app:app", host="0.0.0.0", port=8001, reload=True)
