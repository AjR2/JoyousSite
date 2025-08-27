# models.py
from sqlalchemy import Column, Integer, Text, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
import datetime
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class Memory(Base):
    __tablename__ = "memory"

    id = Column(Integer, primary_key=True)
    user_id = Column(Text, nullable=False)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    prompt_embedding = Column(Vector(1536), nullable=True)  # Allow null for testing
    response_embedding = Column(Vector(1536), nullable=True)  # Allow null for testing
    timestamp = Column(TIMESTAMP, default=datetime.datetime.utcnow)