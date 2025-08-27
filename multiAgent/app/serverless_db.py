"""
Serverless-optimized database connections and operations
"""

import os
import asyncio
import asyncpg
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class ServerlessDatabase:
    """Serverless-optimized database connection manager"""
    
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        self.connection_pool = None
        self._connection = None
    
    async def get_connection(self):
        """Get a database connection optimized for serverless"""
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable not set")
        
        try:
            # For serverless, use single connection instead of pool
            if not self._connection or self._connection.is_closed():
                self._connection = await asyncpg.connect(
                    self.database_url,
                    command_timeout=10,
                    server_settings={
                        'application_name': 'multiagent_serverless',
                        'tcp_keepalives_idle': '600',
                        'tcp_keepalives_interval': '30',
                        'tcp_keepalives_count': '3',
                    }
                )
            return self._connection
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    async def close_connection(self):
        """Close database connection"""
        if self._connection and not self._connection.is_closed():
            await self._connection.close()
            self._connection = None
    
    async def execute_query(self, query: str, *args) -> List[Dict[str, Any]]:
        """Execute a query and return results"""
        conn = await self.get_connection()
        try:
            rows = await conn.fetch(query, *args)
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    async def execute_command(self, command: str, *args) -> str:
        """Execute a command and return status"""
        conn = await self.get_connection()
        try:
            result = await conn.execute(command, *args)
            return result
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            raise

# Global database instance
db = ServerlessDatabase()

class ServerlessMemory:
    """Serverless-optimized memory operations"""
    
    @staticmethod
    async def store_memory(user_id: str, prompt: str, response: str) -> bool:
        """Store memory in serverless environment"""
        try:
            # Generate embeddings (simplified for serverless)
            prompt_embedding = await generate_simple_embedding(prompt)
            response_embedding = await generate_simple_embedding(response)
            
            query = """
            INSERT INTO memory (user_id, prompt, response, prompt_embedding, response_embedding, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6)
            """
            
            await db.execute_command(
                query,
                user_id,
                prompt,
                response,
                prompt_embedding,
                response_embedding,
                datetime.now(timezone.utc)
            )
            
            return True
        except Exception as e:
            logger.error(f"Memory storage failed: {e}")
            return False
    
    @staticmethod
    async def recall_memory(user_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Recall memory in serverless environment"""
        try:
            # Simple text-based search for serverless (fallback)
            sql_query = """
            SELECT prompt, response, timestamp
            FROM memory
            WHERE user_id = $1
            AND (prompt ILIKE $2 OR response ILIKE $2)
            ORDER BY timestamp DESC
            LIMIT $3
            """
            
            search_term = f"%{query}%"
            results = await db.execute_query(sql_query, user_id, search_term, top_k)
            
            return results
        except Exception as e:
            logger.error(f"Memory recall failed: {e}")
            return []

async def generate_simple_embedding(text: str) -> List[float]:
    """Generate simple embedding for serverless environment"""
    try:
        # Simplified embedding generation for serverless
        # In production, you might want to use a lightweight embedding service
        import hashlib
        import struct
        
        # Create a simple hash-based embedding
        hash_obj = hashlib.sha256(text.encode())
        hash_bytes = hash_obj.digest()
        
        # Convert to float array (simplified 32-dimensional embedding)
        embedding = []
        for i in range(0, min(len(hash_bytes), 128), 4):
            chunk = hash_bytes[i:i+4]
            if len(chunk) == 4:
                value = struct.unpack('f', chunk)[0]
                embedding.append(float(value))
        
        # Pad or truncate to fixed size
        target_size = 32
        if len(embedding) < target_size:
            embedding.extend([0.0] * (target_size - len(embedding)))
        else:
            embedding = embedding[:target_size]
        
        return embedding
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        return [0.0] * 32  # Return zero embedding as fallback

# Serverless-optimized Redis alternative using database
class ServerlessCache:
    """Database-backed cache for serverless environments"""
    
    @staticmethod
    async def get(key: str) -> Optional[str]:
        """Get cached value"""
        try:
            query = """
            SELECT value, expires_at FROM cache 
            WHERE key = $1 AND (expires_at IS NULL OR expires_at > NOW())
            """
            results = await db.execute_query(query, key)
            return results[0]['value'] if results else None
        except Exception as e:
            logger.error(f"Cache get failed: {e}")
            return None
    
    @staticmethod
    async def set(key: str, value: str, ttl_seconds: int = 3600) -> bool:
        """Set cached value"""
        try:
            expires_at = datetime.now(timezone.utc).timestamp() + ttl_seconds
            query = """
            INSERT INTO cache (key, value, expires_at, created_at)
            VALUES ($1, $2, to_timestamp($3), NOW())
            ON CONFLICT (key) DO UPDATE SET
                value = EXCLUDED.value,
                expires_at = EXCLUDED.expires_at,
                created_at = NOW()
            """
            await db.execute_command(query, key, value, expires_at)
            return True
        except Exception as e:
            logger.error(f"Cache set failed: {e}")
            return False
    
    @staticmethod
    async def delete(key: str) -> bool:
        """Delete cached value"""
        try:
            query = "DELETE FROM cache WHERE key = $1"
            await db.execute_command(query, key)
            return True
        except Exception as e:
            logger.error(f"Cache delete failed: {e}")
            return False

# Initialize cache
cache = ServerlessCache()

# Database schema for serverless environment
SERVERLESS_SCHEMA = """
-- Memory table (simplified for serverless)
CREATE TABLE IF NOT EXISTS memory (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    prompt_embedding FLOAT[] DEFAULT NULL,
    response_embedding FLOAT[] DEFAULT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_memory_user_id (user_id),
    INDEX idx_memory_timestamp (timestamp)
);

-- Cache table (Redis alternative)
CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table (simplified)
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    task_type TEXT,
    success BOOLEAN DEFAULT TRUE,
    response_time_ms INTEGER,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_analytics_user_id (user_id),
    INDEX idx_analytics_endpoint (endpoint),
    INDEX idx_analytics_timestamp (timestamp)
);

-- Clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache() RETURNS void AS $$
BEGIN
    DELETE FROM cache WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
"""

async def initialize_serverless_db():
    """Initialize database schema for serverless environment"""
    try:
        # Execute schema creation
        statements = SERVERLESS_SCHEMA.split(';')
        for statement in statements:
            if statement.strip():
                await db.execute_command(statement.strip())
        
        logger.info("Serverless database schema initialized")
        return True
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

async def cleanup_serverless_resources():
    """Cleanup resources for serverless environment"""
    try:
        # Clean up expired cache entries
        await db.execute_command("SELECT cleanup_expired_cache()")
        
        # Close database connection
        await db.close_connection()
        
        logger.info("Serverless resources cleaned up")
    except Exception as e:
        logger.error(f"Resource cleanup failed: {e}")

# Export simplified memory functions for compatibility
async def store_memory(user_id: str, prompt: str, response: str) -> bool:
    """Store memory (serverless compatible)"""
    return await ServerlessMemory.store_memory(user_id, prompt, response)

async def recall_memory(user_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Recall memory (serverless compatible)"""
    return await ServerlessMemory.recall_memory(user_id, query, top_k)
