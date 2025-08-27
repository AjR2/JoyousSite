from dotenv import load_dotenv
from openai import AsyncOpenAI
import os
import logging
import asyncio
import time
from datetime import datetime

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Rate limiting configuration
MAX_TOKENS_PER_MIN = 10000  # Adjust based on your OpenAI tier
MAX_REQUESTS_PER_MIN = 5     # Adjust based on your OpenAI tier

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
                logging.warning(f"Rate limit: waiting {wait_time:.2f}s for request limit")
                await asyncio.sleep(wait_time)
                # Recursive call after waiting
                return await self.consume(tokens)
        
        # If not enough tokens, wait until we have enough
        if tokens > self.tokens:
            wait_time = (tokens - self.tokens) / self.refill_rate
            logging.warning(f"Rate limit: waiting {wait_time:.2f}s for token refill")
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

# Initialize token bucket for GPT-4
# Refill rate: MAX_TOKENS_PER_MIN / 60 tokens per second
gpt4_bucket = TokenBucket(MAX_TOKENS_PER_MIN, MAX_TOKENS_PER_MIN / 60)

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
    logging.info(f"GPT-4 prompt truncated from ~{estimated_tokens} to ~{max_tokens} tokens")
    return truncated


async def call_gpt4(prompt, max_tokens_output=1024, max_tokens_input=4000, retry_attempts=3, retry_delay=5):
    """
    Call GPT-4 with rate limiting and retry logic
    
    Args:
        prompt: The prompt to send to GPT-4
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
        logging.warning(f"GPT-4 prompt truncated from {len(prompt)} to {len(truncated_prompt)} characters")
    
    # Wait for token bucket to have enough tokens
    await gpt4_bucket.consume(estimated_tokens + max_tokens_output)
    
    # Try with retries
    for attempt in range(retry_attempts):
        try:
            client = AsyncOpenAI(api_key=OPENAI_API_KEY)
            start_time = time.time()
            response = await client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[{"role": "user", "content": truncated_prompt}],
                max_tokens=max_tokens_output
            )
            elapsed = time.time() - start_time
            logging.info(f"GPT-4 call completed in {elapsed:.2f}s")
            return response.choices[0].message.content
            
        except Exception as e:
            error_msg = str(e)
            logging.error(f"Error calling GPT-4 (attempt {attempt+1}/{retry_attempts}): {error_msg}")
            
            # Check if it's a rate limit error
            if "rate limit" in error_msg.lower() or "tokens per min" in error_msg.lower():
                wait_time = retry_delay * (attempt + 1)  # Exponential backoff
                logging.warning(f"Rate limit exceeded. Waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
            elif attempt < retry_attempts - 1:
                # For other errors, retry with shorter delay
                await asyncio.sleep(retry_delay)
            else:
                # Last attempt failed
                return f"Error calling GPT-4 after {retry_attempts} attempts: {error_msg}"
    
    # This should not be reached due to the return in the last iteration of the loop
    return "Error: Maximum retry attempts exceeded"