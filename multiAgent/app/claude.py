from dotenv import load_dotenv
import os
import anthropic
import logging

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Maximum prompt size in tokens (approximate)
MAX_PROMPT_TOKENS = 100000  # Adjust this based on Claude's limits

def truncate_prompt(prompt, max_chars=32000):
    """
    Truncate prompt to stay within Claude's token limits.
    This is a simple character-based truncation as a fallback.
    """
    if len(prompt) <= max_chars:
        return prompt
    
    # Keep the first part and last part of the prompt, removing the middle
    # This preserves context and instructions while reducing size
    first_part = int(max_chars * 0.7)  # 70% from beginning
    last_part = max_chars - first_part  # 30% from end
    
    truncated = prompt[:first_part] + "\n\n[Content truncated due to length]\n\n" + prompt[-last_part:]
    logging.info(f"Prompt truncated from {len(prompt)} to {len(truncated)} characters")
    return truncated

async def call_claude(prompt, model="claude-sonnet-4-20250514", max_prompt_chars=32000):
    """
    Call Claude API with automatic prompt truncation to avoid rate limits.
    
    Args:
        prompt: The prompt to send to Claude
        model: Claude model to use
        max_prompt_chars: Maximum characters to allow in prompt
    """
    try:
        # Truncate prompt if needed
        truncated_prompt = truncate_prompt(prompt, max_prompt_chars)
        
        client = anthropic.AsyncAnthropic(
            api_key=ANTHROPIC_API_KEY,
            default_headers={"anthropic-version": "2023-06-01"}
        )
        
        # Log if truncation occurred
        if len(truncated_prompt) < len(prompt):
            logging.warning(f"Claude prompt truncated from {len(prompt)} to {len(truncated_prompt)} characters")
        
        response = await client.messages.create(
            model=model,
            max_tokens=512,
            messages=[{"role": "user", "content": truncated_prompt}]
        )
        
        if isinstance(response.content, list):
            return " ".join(str(block.text) for block in response.content)
        return response.content.strip()
    except Exception as e:
        logging.error(f"Error calling Claude: {str(e)}")
        return f"Error calling Claude: {str(e)}"