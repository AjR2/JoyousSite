from sqlalchemy import Column, Integer, Text, TIMESTAMP, Float
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Text, nullable=False)
    conversation_id = Column(Text, nullable=False)  # To group actions in the same conversation
    agent_name = Column(Text, nullable=False)  # e.g., 'Claude', 'GPT-4', 'Grok'
    task_type = Column(Text, nullable=False)  # e.g., 'task_breakdown', 'explanation', 'fact_check'
    prompt = Column(Text, nullable=False)
    response = Column(Text)  # Nullable because we might log before getting response
    error = Column(Text)  # For storing error messages if any
    duration = Column(Float)  # Duration in seconds
    status = Column(Text, nullable=False)  # 'started', 'completed', 'error', 'timeout'
    timestamp = Column(TIMESTAMP, default=datetime.datetime.utcnow)
