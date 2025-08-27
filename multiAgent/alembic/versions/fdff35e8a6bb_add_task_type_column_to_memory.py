"""Add task_type column to memory

Revision ID: fdff35e8a6bb
Revises: 2b7e1ba9dfa5
Create Date: 2025-04-15 10:57:36.316416
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import pgvector

# revision identifiers, used by Alembic.
revision: str = 'fdff35e8a6bb'
down_revision: Union[str, None] = '2b7e1ba9dfa5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Step 1: Update NULL values in prompt_embedding column with a default value
    op.execute("UPDATE memory SET prompt_embedding = '[{}]' WHERE prompt_embedding IS NULL".format(', '.join(['0.0'] * 1536)))

    # Step 2: Add task_type column
    op.add_column('memory', sa.Column('task_type', sa.Text(), nullable=True))

    # Step 3: Alter prompt_embedding and response_embedding columns to NOT NULL
    op.alter_column('memory', 'prompt_embedding',
                    existing_type=pgvector.sqlalchemy.vector.VECTOR(dim=1536),
                    nullable=False)
    op.alter_column('memory', 'response_embedding',
                    existing_type=pgvector.sqlalchemy.vector.VECTOR(dim=1536),
                    nullable=False)

    # Step 4: Drop index on 'memory' table
    op.drop_index('ix_memory_id', table_name='memory')


def downgrade() -> None:
    """Downgrade schema."""
    # Step 1: Recreate index on 'memory' table
    op.create_index('ix_memory_id', 'memory', ['id'], unique=False)

    # Step 2: Alter prompt_embedding and response_embedding columns to allow NULL
    op.alter_column('memory', 'response_embedding',
                    existing_type=pgvector.sqlalchemy.vector.VECTOR(dim=1536),
                    nullable=True)
    op.alter_column('memory', 'prompt_embedding',
                    existing_type=pgvector.sqlalchemy.vector.VECTOR(dim=1536),
                    nullable=True)

    # Step 3: Drop task_type column
    op.drop_column('memory', 'task_type')
