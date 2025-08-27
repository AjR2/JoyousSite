"""
Vercel serverless function for multi-agent collaboration
"""

import json
import os
import asyncio
from typing import Dict, Any
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.llms import ask_gpt, ask_claude, ask_grok
from app.task_priority import TaskPriorityManager, Priority
from app.quality_control import quality_controller
from app.memory import store_memory, recall_memory

async def handle_collaborate_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Handle collaboration request in serverless environment"""
    try:
        prompt = request_data.get("prompt")
        user_id = request_data.get("user_id")
        
        if not prompt or not user_id:
            return {
                "error": "Missing required parameters: prompt and user_id",
                "status_code": 400
            }
        
        # Get memory context
        try:
            memory_context = await recall_memory(user_id, prompt, top_k=5)
            context_text = "\n".join([f"Previous: {m['prompt']} -> {m['response'][:200]}..." for m in memory_context])
        except Exception as e:
            print(f"Memory recall failed: {e}")
            context_text = ""
        
        # Create task manager
        task_manager = TaskPriorityManager(user_id)
        
        # Add tasks with simplified dependencies for serverless
        task_manager.add_task(
            name="task_analysis",
            agent_func=ask_claude,
            prompt=f"Break down this complex task into components: {prompt}",
            priority=Priority.HIGH,
            timeout=30,
            task_type="task_breakdown"
        )
        
        task_manager.add_task(
            name="initial_explanation",
            agent_func=ask_gpt,
            prompt=f"Provide a detailed explanation: {prompt}",
            priority=Priority.MEDIUM,
            timeout=30,
            task_type="explanation"
        )
        
        task_manager.add_task(
            name="fact_check",
            agent_func=ask_grok,
            prompt=f"Fact-check and verify information about: {prompt}",
            priority=Priority.HIGH,
            timeout=25,
            task_type="fact_check"
        )
        
        # Execute tasks (simplified for serverless timeout constraints)
        results = await task_manager.execute_all()
        
        # Quality assessment for each result
        quality_assessments = {}
        for task_name, result in results.items():
            if result and result != 'Failed':
                task_type_mapping = {
                    'task_analysis': 'task_breakdown',
                    'initial_explanation': 'explanation',
                    'fact_check': 'fact_check'
                }
                task_type = task_type_mapping.get(task_name, 'explanation')
                
                quality_metrics = await quality_controller.comprehensive_quality_assessment(
                    result, task_type, prompt, context_text
                )
                
                quality_assessments[task_name] = {
                    'confidence_score': quality_metrics.confidence_score,
                    'coherence_score': quality_metrics.coherence_score,
                    'completeness_score': quality_metrics.completeness_score,
                    'content_flags': quality_metrics.content_flags
                }
        
        # Create final synthesis
        synthesis_prompt = f"""
        Based on the following analysis, provide a comprehensive final response to: {prompt}
        
        Task Analysis: {results.get('task_analysis', 'Not available')}
        Explanation: {results.get('initial_explanation', 'Not available')}
        Fact Check: {results.get('fact_check', 'Not available')}
        
        Synthesize this into a clear, comprehensive response.
        """
        
        final_response = await ask_claude(synthesis_prompt)
        
        # Contradiction detection (simplified)
        agent_outputs = {k: v for k, v in results.items() if v and v != 'Failed'}
        contradiction_report = await quality_controller.enhanced_contradiction_detection(agent_outputs)
        
        # Store final result in memory
        try:
            await store_memory(user_id, prompt, final_response)
        except Exception as e:
            print(f"Memory storage failed: {e}")
        
        # Get execution summary
        execution_summary = task_manager.get_execution_summary()
        
        return {
            "Task Breakdown": results.get('task_analysis', 'Failed'),
            "Initial Explanation": results.get('initial_explanation', 'Failed'),
            "Fact Check": results.get('fact_check', 'Failed'),
            "Final Response": final_response,
            "Quality Assessments": quality_assessments,
            "Contradiction Report": {
                "contradictions_found": len(contradiction_report.contradictions_found),
                "severity_level": contradiction_report.severity_level,
                "confidence_in_detection": contradiction_report.confidence_in_detection
            },
            "Execution Summary": execution_summary,
            "Confidence Scores": {name: assessment.get('confidence_score', 0.0) 
                               for name, assessment in quality_assessments.items()},
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
        result = loop.run_until_complete(handle_collaborate_request(request_data))
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
