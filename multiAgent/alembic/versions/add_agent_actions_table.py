"""add agent actions table

Revision ID: add_agent_actions_table
Revises: fdff35e8a6bb
Create Date: 2025-04-16 11:05:26.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_agent_actions_table'
down_revision = 'fdff35e8a6bb'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'agent_actions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Text(), nullable=False),
        sa.Column('conversation_id', sa.Text(), nullable=False),
        sa.Column('agent_name', sa.Text(), nullable=False),
        sa.Column('task_type', sa.Text(), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('response', sa.Text(), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('status', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_actions_conversation_id'), 'agent_actions', ['conversation_id'], unique=False)
    op.create_index(op.f('ix_agent_actions_user_id'), 'agent_actions', ['user_id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_agent_actions_user_id'), table_name='agent_actions')
    op.drop_index(op.f('ix_agent_actions_conversation_id'), table_name='agent_actions')
    op.drop_table('agent_actions')
