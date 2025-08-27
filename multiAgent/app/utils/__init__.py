import os
import asyncio
from openai import AsyncOpenAI
from fastapi import HTTPException
from dotenv import load_dotenv
from app.grok import call_grok
from app.claude import call_claude
from app.gpt import call_gpt4

# Load environment variables and initialize OpenAI client
load_dotenv()
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))



# Ensure truncate_tokens function is defined
def truncate_tokens(text: str, max_tokens: int = 500):
    """Truncate tokens to the specified maximum length."""
    tokens = text.split()
    return " ".join(tokens[:max_tokens])

# Retry logic for transient failures

from typing import List, Tuple, Dict

async def detect_contradictions_between_agents(agent_outputs: Dict[str, str]) -> List[Tuple[str, str, str, str]]:
    """
    Detect contradictions between agent outputs.
    Returns a list of (agent1, output1, agent2, output2) for each contradiction found.
    Uses simple heuristics: flags outputs that are semantically very different (low similarity) or contain negations of each other.
    """
    import difflib
    contradictions = []
    agents = list(agent_outputs.keys())
    for i in range(len(agents)):
        for j in range(i+1, len(agents)):
            a1, a2 = agents[i], agents[j]
            o1, o2 = agent_outputs[a1], agent_outputs[a2]
            seq = difflib.SequenceMatcher(None, o1.lower(), o2.lower())
            similarity = seq.ratio()
            # Heuristic: if similarity is very low, flag as contradiction
            if similarity < 0.5:
                contradictions.append((a1, o1, a2, o2))
            # Heuristic: if one contains 'not' and the other doesn't, flag
            elif (" not " in o1.lower() or "n't" in o1.lower()) != (" not " in o2.lower() or "n't" in o2.lower()):
                contradictions.append((a1, o1, a2, o2))
    return contradictions

async def resolve_contradictions_with_claude(contradictions: List[Tuple[str, str, str, str]]) -> str:
    """
    Use Claude to resolve or note contradictions between agent outputs.
    """
    if not contradictions:
        return "No contradictions detected."
    prompt = "The following agent responses appear to contradict each other. Please resolve the contradiction or note the disagreement.\n\n"
    for idx, (a1, o1, a2, o2) in enumerate(contradictions, 1):
        prompt += f"Contradiction {idx}:\nAgent 1 ({a1}): {o1}\nAgent 2 ({a2}): {o2}\n\n"
    prompt += "\nResolution or Note:"
    from app.claude import call_claude
    resolution = await call_claude(prompt)
    return resolution

async def score_response_confidence(response: str, task_type: str, prompt: str) -> float:
    """
    Score the confidence of an agent response using heuristics and/or LLM evaluation.
    Returns a confidence score between 0.0 and 1.0.
    
    Args:
        response: The agent's response text
        task_type: The type of task (e.g., 'explanation', 'fact_check')
        prompt: The original prompt given to the agent
    
    Returns:
        float: Confidence score between 0.0 and 1.0
    """
    # Heuristic 1: Length-based confidence (very short responses may indicate uncertainty)
    length_score = min(1.0, len(response) / 500)  # Normalize up to 500 chars
    
    # Heuristic 2: Uncertainty markers
    uncertainty_phrases = [
        "i'm not sure", "uncertain", "unclear", "might be", "could be", 
        "possibly", "perhaps", "i don't know", "not certain", "can't determine",
        "insufficient information", "hard to say", "difficult to determine"
    ]
    uncertainty_count = sum(1 for phrase in uncertainty_phrases if phrase in response.lower())
    uncertainty_score = max(0.0, 1.0 - (uncertainty_count * 0.1))  # Deduct 0.1 per uncertainty phrase
    
    # Heuristic 3: Task-specific confidence indicators
    task_confidence = 0.8  # Default confidence
    if task_type == 'fact_check':
        # For fact checks, look for definitive statements
        if any(phrase in response.lower() for phrase in ["confirmed", "verified", "accurate", "correct"]):
            task_confidence = 0.9
        elif any(phrase in response.lower() for phrase in ["incorrect", "inaccurate", "false"]):
            task_confidence = 0.85
    elif task_type == 'explanation':
        # For explanations, look for thorough responses with examples
        if "example" in response.lower() and len(response) > 1000:
            task_confidence = 0.95
    
    # Combine scores with different weights
    combined_score = (
        length_score * 0.2 +
        uncertainty_score * 0.5 +
        task_confidence * 0.3
    )
    
    return max(0.0, min(1.0, combined_score))  # Ensure score is between 0.0 and 1.0


import re
import aiohttp
from typing import List, Dict

async def detect_hallucinated_citations(response: str, claim_context: str = "") -> List[Dict]:
    """
    Detect hallucinated citations in a response by extracting bracketed citations and URLs, retrieving cited content, and comparing it to the claim.
    Returns a list of hallucination reports (empty if none found).
    """
    # Extract bracketed citations like [1], [2], etc.
    bracket_citations = re.findall(r'\[(\d+)\]', response)
    # Extract URLs
    url_citations = re.findall(r'(https?://\S+)', response)

    hallucinations = []

    # Check bracketed citations (assume claim_context provides mapping if available)
    for cit in bracket_citations:
        # In a real system, map [n] to a source. Here, we just flag as unverifiable unless mapping is provided.
        hallucinations.append({
            'citation': f'[{cit}]',
            'reason': 'Bracketed citation cannot be verified without mapping to a source.'
        })

    # Check URL citations
    for url in url_citations:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        # Compare claim context or response chunk to the cited text
                        # For simplicity, use keyword overlap; in a real system use embeddings
                        # If you want to use embeddings, import here:
                        # from app.utils import embed_text
                        overlap = set(response.lower().split()) & set(text.lower().split())
                        if len(overlap) < 3:  # Arbitrary threshold
                            hallucinations.append({
                                'citation': url,
                                'reason': 'Low keyword overlap between claim and cited source.'
                            })
                    else:
                        hallucinations.append({
                            'citation': url,
                            'reason': f'URL returned status {resp.status}'
                        })
        except Exception as e:
            hallucinations.append({
                'citation': url,
                'reason': f'Error retrieving cited URL: {str(e)}'
            })

    return hallucinations

async def fetch_with_retries(url: str, method: str, retries: int = 3):
    """Function to handle retries for API requests with exponential backoff."""
    for attempt in range(retries):
        try:
            async with aiohttp.ClientSession() as session:
                async with getattr(session, method)(url) as response:
                    if response.status == 200:
                        return await response.json()  # Return the successful response
                    else:
                        raise Exception(f"API returned status {response.status}")
        except Exception as e:
            if attempt < retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Error: {e}, retrying in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
            else:
                print(f"Failed after {retries} retries. Error: {e}")
                return None  # Return None if retries are exhausted

# Example API call function with retries
async def embed_text(text: str) -> list:
    """Function to embed text using OpenAI's embeddings."""
    print("🧪 embed_text input:", text, type(text))
    if not isinstance(text, str) or not text.strip():
        raise ValueError(f"Invalid input for embedding: {text}")
    try:
        response = await openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {e}")

from .agent_logger import AgentLogger, AgentActionTracker

# Map of function names to agent names and task types
AGENT_MAPPING = {
    'call_claude': {'name': 'Claude', 'default_task': 'general'},
    'call_gpt4': {'name': 'GPT-4', 'default_task': 'general'},
    'call_grok': {'name': 'Grok', 'default_task': 'fact_check'}
}

# Timeout wrapper for agent calls
async def call_agent_with_timeout(agent_func, prompt: str, timeout: int = 30, *, 
                               user_id: str = 'default_user', task_type: str = None,
                               logger: AgentLogger = None):
    """Call an agent function with a timeout and logging.
    
    Args:
        agent_func: The agent function to call
        prompt: The prompt to send to the agent
        timeout: Timeout in seconds (default: 30)
        user_id: ID of the user making the request
        task_type: Type of task being performed
        logger: AgentLogger instance (will create new one if None)
    
    Returns:
        Response from the agent or error message if timeout/error occurs
    """
    # Get agent name from the function
    func_name = agent_func.__name__
    agent_info = AGENT_MAPPING.get(func_name, {'name': 'Unknown', 'default_task': 'general'})
    
    # Create logger if not provided
    if logger is None:
        logger = AgentLogger(user_id)
    
    # Use provided task type or default from mapping
    task_type = task_type or agent_info['default_task']
    
    async with AgentActionTracker(logger, agent_info['name'], task_type, prompt) as tracker:
        try:
            # Create a task for the agent call
            agent_task = asyncio.create_task(agent_func(prompt))
            # Wait for the task with a timeout
            response = await asyncio.wait_for(agent_task, timeout=timeout)
            # Log the successful response
            await tracker.update_response(response)
            return response
        except asyncio.TimeoutError:
            error_msg = f"Agent timed out after {timeout} seconds"
            return error_msg
        except Exception as e:
            error_msg = f"Agent error: {str(e)}"
            return error_msg

# Initialize AGENTS with relevant agent functions or objects
AGENTS = {
    'GPT-4': call_gpt4,
    'Claude': call_claude,
    'Grok': call_grok,
}

from typing import Dict, Any

# Execute tasks function (refactor as needed)

async def verify_final_response(prompt: str, final_response: str, agent_outputs: Dict[str, str] = None) -> Dict[str, Any]:
    """Verify the quality of the final response using Claude or GPT-4.
    
    Args:
        prompt: The original user prompt
        final_response: The synthesized final response
        agent_outputs: Optional dictionary of individual agent outputs for context
    
    Returns:
        Dictionary containing verification results including:
        - score: float between 0-1
        - feedback: str explaining the rating
        - suggestions: list of improvement suggestions
    """
    verification_prompt = f"""
    You are a quality assurance expert. Evaluate this response to the following prompt.
    
    Original Prompt: "{prompt}"
    
    Final Response: "{final_response}"
    
    {f'Individual Agent Outputs for Reference:\n{chr(10).join([f"{k}: {v}" for k,v in agent_outputs.items()])}' if agent_outputs else ''}
    
    Evaluate the response on:
    1. Accuracy and factual correctness
    2. Completeness in addressing the prompt
    3. Clarity and coherence
    4. Proper citation/sourcing if needed
    5. Logical flow and structure
    
    Return your evaluation as JSON with these fields:
    - score: float between 0-1
    - feedback: string explaining the rating
    - suggestions: list of specific improvement suggestions
    """
    
    try:
        # Use Claude for verification to get a different perspective than GPT-4
        result = await call_claude(verification_prompt)
        # Parse the JSON response
        import json
        return json.loads(result)
    except Exception as e:
        return {
            "score": 0.0,
            "feedback": f"Error during verification: {str(e)}",
            "suggestions": ["Verification failed - please review manually"]
        }
async def execute_tasks(prompt, context_summary):
    """Execute tasks based on the prompt and context summary."""
    try:
        task_outputs = {}

        # Example: Process tasks using AGENTS or relevant task handlers
        for task_type, agent in AGENTS.items():
            task_input = f"Task: {task_type}\nContext: {context_summary}\nPrompt: {prompt}"
            response = await agent(task_input)
            task_outputs[task_type] = response

        return task_outputs, context_summary
    except Exception as e:
        raise Exception(f"Error in executing tasks: {str(e)}")