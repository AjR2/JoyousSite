# memory.py

import datetime
import sys
import os
from sqlalchemy import text, select
from app.db import async_session
from app.models import Memory
from pgvector.sqlalchemy import Vector
from app.utils import embed_text, openai_client
import asyncio

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def store_memory(user_id: str, prompt: str, response: str):
    """Store memory with embeddings if possible"""
    async with async_session() as session:
        try:
            # Try to get embeddings, but continue even if they fail
            prompt_embedding = None
            response_embedding = None
            try:
                prompt_embedding = await embed_text(prompt)
                response_embedding = await embed_text(response)
            except Exception as e:
                print(f"Warning: Failed to create embeddings: {e}")

            # Create Memory instance with available data
            memory = Memory(
                user_id=user_id,
                prompt=prompt,
                response=response,
                prompt_embedding=prompt_embedding,
                response_embedding=response_embedding,
                timestamp=datetime.datetime.utcnow()
            )
            # Add the memory record to the session and commit it
            session.add(memory)
            await session.commit()
            return True
        except Exception as e:
            print(f"❌ Failed to store memory: {e}")
            return False

async def recall_memory(user_id: str, prompt: str, top_k: int = 5):
    """Recall memory based on semantic similarity if possible, otherwise return recent memories"""
    async with async_session() as session:
        try:
            # Try to get embedding for semantic search
            try:
                prompt_embedding = await embed_text(prompt)
                # Query the memory table for the top_k most similar memories
                stmt = (
                    select(Memory.prompt, Memory.response)
                    .where(Memory.user_id == user_id)
                    .where(Memory.prompt_embedding.is_not(None))  # Only search where embeddings exist
                    .order_by(Memory.prompt_embedding.l2_distance(prompt_embedding))  # Order by distance
                    .limit(top_k)  # Limit to top K matches
                )
            except Exception as e:
                print(f"Warning: Semantic search failed, falling back to recent memories: {e}")
                # Fallback to recent memories if embedding fails
                stmt = (
                    select(Memory.prompt, Memory.response)
                    .where(Memory.user_id == user_id)
                    .order_by(Memory.timestamp.desc())
                    .limit(top_k)
                )

            result = await session.execute(stmt)
            memories = result.fetchall()

            relevant_snippets = []
            for prompt_text, response_text in memories:
                # Format and limit the length of snippets for memory recall
                snippet = {
                    "prompt": prompt_text[:150] + ("..." if len(prompt_text) > 150 else ""),
                    "response": response_text[:300] + ("..." if len(response_text) > 300 else "")
                }
                relevant_snippets.append(snippet)
            return relevant_snippets
        except Exception as e:
            print(f"❌ Failed to recall memory: {e}")
            return []