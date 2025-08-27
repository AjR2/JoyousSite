"""
Vercel serverless function for single agent queries
"""

import json
import os
import asyncio
from typing import Dict, Any
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.llms import ask_gpt, ask_claude, ask_grok
from app.config import config
from app.quality_control import quality_controller
from app.utils import embed_text
from app.memory import store_memory, recall_memory

# Agent registry for serverless environment
AGENT_REGISTRY = {
    "explanation": ask_gpt,
    "task_breakdown": ask_claude,
    "fact_check": ask_grok,
    "code_generation": ask_gpt,
    "final_synthesis": ask_claude
}

async def handle_ask_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Handle ask request in serverless environment"""
    try:
        prompt = request_data.get("prompt")
        task_type = request_data.get("task_type", "explanation")
        user_id = request_data.get("user_id")
        
        if not prompt or not user_id:
            return {
                "error": "Missing required parameters: prompt and user_id",
                "status_code": 400
            }
        
        if task_type not in AGENT_REGISTRY:
            return {
                "error": f"Invalid task_type. Must be one of: {list(AGENT_REGISTRY.keys())}",
                "status_code": 400
            }
        
        # Get memory context (simplified for serverless)
        try:
            memory_context = await recall_memory(user_id, prompt, top_k=3)
            context_text = "\n".join([f"Previous: {m['prompt']} -> {m['response']}" for m in memory_context])
        except Exception as e:
            print(f"Memory recall failed: {e}")
            context_text = ""
        
        # Enhance prompt with context
        enhanced_prompt = f"{context_text}\n\nCurrent query: {prompt}" if context_text else prompt
        
        # Get agent function
        agent_func = AGENT_REGISTRY[task_type]
        
        # Execute agent
        response = await agent_func(enhanced_prompt)
        
        # Quality assessment
        quality_metrics = await quality_controller.comprehensive_quality_assessment(
            response, task_type, prompt, context_text
        )
        
        # Store in memory
        try:
            await store_memory(user_id, prompt, response)
        except Exception as e:
            print(f"Memory storage failed: {e}")
        
        return {
            "Final Response": response,
            "Quality Assessment": {
                "confidence_score": quality_metrics.confidence_score,
                "coherence_score": quality_metrics.coherence_score,
                "completeness_score": quality_metrics.completeness_score,
                "content_flags": quality_metrics.content_flags,
                "word_count": quality_metrics.word_count
            },
            "Task Type": task_type,
            "Agent Used": agent_func.__name__,
            "status_code": 200
        }
        
    except Exception as e:
        return {
            "error": f"Internal server error: {str(e)}",
            "status_code": 500
        }

def handler(request):
    """Vercel serverless function handler"""
    try:
        # Handle CORS
        if request.method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": ""
            }
        
        if request.method != "POST":
            return {
                "statusCode": 405,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Method not allowed"})
            }
        
        # Parse request body
        if hasattr(request, 'body'):
            body = request.body
        else:
            body = request.get('body', '{}')
            
        if isinstance(body, str):
            request_data = json.loads(body)
        else:
            request_data = body
        
        # Run async handler
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(handle_ask_request(request_data))
        loop.close()
        
        status_code = result.pop("status_code", 200)
        
        return {
            "statusCode": status_code,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps(result)
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": f"Handler error: {str(e)}"})
        }

# For Vercel Python runtime
def main(request):
    return handler(request)
