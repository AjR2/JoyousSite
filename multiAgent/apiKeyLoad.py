import asyncio
import asyncpg

# Replace this with your actual credentials if needed
DATABASE_URL = "postgresql://ajrudd@localhost/ai_memory"

async def test_db():
    try:
        pool = await asyncpg.create_pool(DATABASE_URL)
        async with pool.acquire() as conn:
            # Insert a test row
            await conn.execute("""
                INSERT INTO memory (user_id, prompt, response) 
                VALUES ($1, $2, $3)
            """, "test_user", "What is recursion?", "Recursion is when a function calls itself.")

            # Fetch recent rows
            rows = await conn.fetch("SELECT * FROM memory ORDER BY timestamp DESC LIMIT 3")

            for row in rows:
                print(dict(row))

    except Exception as e:
        print("❌ Database connection or query failed:", e)

asyncio.run(test_db())