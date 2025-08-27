import psycopg2

# Connect to PostgreSQL
connection = psycopg2.connect(
    dbname="ai_memory", user="ajrudd", password="yourpassword", host="localhost", port="5432"
)
cursor = connection.cursor()

# Create the zero vector with 1536 zeros
zero_vector = [0.0] * 1536  # 1536 zeroes

# Update the memory table to set null prompt embeddings to a vector of zeros
cursor.execute(
    "UPDATE memory SET prompt_embedding = %s WHERE prompt_embedding IS NULL",
    (zero_vector,)
)
cursor.execute(
    "UPDATE memory SET response_embedding = %s WHERE response_embedding IS NULL",
    (zero_vector,)
)

# Commit changes and close connection
connection.commit()
cursor.close()
connection.close()

print("Embeddings updated successfully.")