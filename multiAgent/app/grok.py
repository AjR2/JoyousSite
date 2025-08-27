from dotenv import load_dotenv
import os
import aiohttp
import logging
import asyncio
import time
import re

load_dotenv()

XAI_GROK_API_KEY = os.getenv("XAI_GROK_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/completions"
GROK_MODEL = "grok-2-1212"

# Rate limiting configuration for Grok
MAX_REQUESTS_PER_MIN = 10  # Adjust based on Grok's actual limits
MAX_TOKENS_PER_MIN = 20000  # Adjust based on Grok's actual limits

# Token tracking for rate limiting
class TokenBucket:
    """Simple token bucket for rate limiting"""
    def __init__(self, max_tokens, refill_rate):
        self.max_tokens = max_tokens
        self.tokens = max_tokens
        self.refill_rate = refill_rate  # tokens per second
        self.last_refill = time.time()
        self.request_timestamps = []
    
    async def consume(self, tokens):
        """Consume tokens from the bucket, waiting if necessary"""
        # First, refill based on time elapsed
        self._refill()
        
        # Track request rate
        now = time.time()
        self.request_timestamps = [ts for ts in self.request_timestamps if now - ts < 60]
        
        # Check if we're exceeding request rate
        if len(self.request_timestamps) >= MAX_REQUESTS_PER_MIN:
            wait_time = 60 - (now - self.request_timestamps[0])
            if wait_time > 0:
                logging.warning(f"Grok rate limit: waiting {wait_time:.2f}s for request limit")
                await asyncio.sleep(wait_time)
                # Recursive call after waiting
                return await self.consume(tokens)
        
        # If not enough tokens, wait until we have enough
        if tokens > self.tokens:
            wait_time = (tokens - self.tokens) / self.refill_rate
            logging.warning(f"Grok rate limit: waiting {wait_time:.2f}s for token refill")
            await asyncio.sleep(wait_time)
            self._refill()
        
        # Consume tokens and record timestamp
        self.tokens -= tokens
        self.request_timestamps.append(time.time())
        return True
    
    def _refill(self):
        """Refill tokens based on time elapsed"""
        now = time.time()
        elapsed = now - self.last_refill
        new_tokens = elapsed * self.refill_rate
        self.tokens = min(self.max_tokens, self.tokens + new_tokens)
        self.last_refill = now

# Initialize token bucket for Grok
# Refill rate: MAX_TOKENS_PER_MIN / 60 tokens per second
grok_bucket = TokenBucket(MAX_TOKENS_PER_MIN, MAX_TOKENS_PER_MIN / 60)

# Approximate token count estimation
def estimate_tokens(text):
    """Estimate token count based on character count (rough approximation)"""
    return len(text) // 4  # Rough estimate: ~4 chars per token

def truncate_prompt(prompt, max_tokens=4000):
    """Truncate prompt to stay within token limits"""
    estimated_tokens = estimate_tokens(prompt)
    
    if estimated_tokens <= max_tokens:
        return prompt
    
    # Calculate approximate character limit
    char_limit = max_tokens * 4
    
    # Keep the first part and last part of the prompt, removing the middle
    first_part = int(char_limit * 0.7)  # 70% from beginning
    last_part = char_limit - first_part  # 30% from end
    
    truncated = prompt[:first_part] + "\n\n[Content truncated due to length]\n\n" + prompt[-last_part:]
    logging.info(f"Grok prompt truncated from ~{estimated_tokens} to ~{max_tokens} tokens")
    return truncated

def clean_grok_output(output: str, prompt: str = "") -> str:
    # Remove HTML tags
    output = re.sub(r'<[^>]+>', '', output)
    # Remove repeated prompt lines
    lines = [line.strip() for line in output.splitlines() if line.strip()]
    if prompt:
        lines = [line for line in lines if prompt.strip() not in line]
    # Remove navigation/meta lines
    nav_keywords = [
        "Skip to main content", "Return to the question list", "Send to a friend", "Read about how to send as an email",
        "Search Notes & Queries", "Notes and Queries", "guardian.co.uk", "Add your answer", "Last updated:", "Home", "Links & services", "Tools", "Contact us", "About us", "Current debates", "Related debates"
    ]
    filtered = []
    for line in lines:
        if any(nav.lower() in line.lower() for nav in nav_keywords):
            continue
        filtered.append(line)
    # Heuristic: Prefer lines containing factual answers and sources
    answer_lines = [line for line in filtered if (" is " in line and ("source:" in line.lower() or "(source:" in line.lower()))]
    if not answer_lines:
        # Fallback: any line with ' is '
        answer_lines = [line for line in filtered if " is " in line]
    if not answer_lines:
        # Fallback: any remaining content
        answer_lines = filtered
    return "\n".join(answer_lines).strip()

async def call_grok(prompt, max_tokens_output=512, max_tokens_input=4000, retry_attempts=3, retry_delay=5):
    """
    Call Grok with rate limiting and retry logic
    
    Args:
        prompt: The prompt to send to Grok
        max_tokens_output: Maximum tokens in the response
        max_tokens_input: Maximum tokens in the input prompt
        retry_attempts: Number of retry attempts if rate limited
        retry_delay: Delay between retries in seconds
    """
    # Truncate prompt if needed
    truncated_prompt = truncate_prompt(prompt, max_tokens_input)
    estimated_tokens = estimate_tokens(truncated_prompt)
    
    # Log if truncation occurred
    if truncated_prompt != prompt:
        logging.warning(f"Grok prompt truncated from {len(prompt)} to {len(truncated_prompt)} characters")
    
    # Wait for token bucket to have enough tokens
    await grok_bucket.consume(estimated_tokens + max_tokens_output)
    
    headers = {
        "Authorization": f"Bearer {XAI_GROK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {"model": GROK_MODEL, "prompt": truncated_prompt, "max_tokens": max_tokens_output}
    
    # Try with retries
    for attempt in range(retry_attempts):
        try:
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.post(GROK_API_URL, json=data, headers=headers, timeout=15) as response:
                    elapsed = time.time() - start_time
                    if response.status == 200:
                        result = await response.json()
                        raw = result.get("choices", [{}])[0].get("text", "").strip()
                        logging.info(f"Grok call completed in {elapsed:.2f}s")
                        return clean_grok_output(raw, truncated_prompt)
                    
                    error_text = await response.text()
                    logging.error(f"Error calling Grok (attempt {attempt+1}/{retry_attempts}): {error_text}")
                    
                    # Check if it's a rate limit error
                    if response.status == 429 or "rate limit" in error_text.lower() or "too many requests" in error_text.lower():
                        wait_time = retry_delay * (attempt + 1)  # Exponential backoff
                        logging.warning(f"Grok rate limit exceeded. Waiting {wait_time}s before retry...")
                        await asyncio.sleep(wait_time)
                    elif attempt < retry_attempts - 1:
                        # For other errors, retry with shorter delay
                        await asyncio.sleep(retry_delay)
                    else:
                        # Last attempt failed
                        return f"Error calling Grok after {retry_attempts} attempts: {error_text}"
        except aiohttp.ClientError as e:
            error_msg = str(e)
            logging.error(f"ClientError calling Grok (attempt {attempt+1}/{retry_attempts}): {error_msg}")
            if attempt < retry_attempts - 1:
                await asyncio.sleep(retry_delay)
            else:
                return f"ClientError calling Grok after {retry_attempts} attempts: {error_msg}"
        except Exception as e:
            error_msg = str(e)
            logging.error(f"Unexpected error calling Grok (attempt {attempt+1}/{retry_attempts}): {error_msg}")
            if attempt < retry_attempts - 1:
                await asyncio.sleep(retry_delay)
            else:
                return f"Error calling Grok after {retry_attempts} attempts: {error_msg}"
    
    # This should not be reached due to the return in the last iteration of the loop
    return "Error: Maximum retry attempts exceeded"

if __name__ == "__main__":
    import asyncio
    prompt = "What is the capital of France? Include a citation if possible."
    result = asyncio.run(call_grok(prompt))
    print("Grok response:", result)