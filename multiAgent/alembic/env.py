from logging.config import fileConfig

import os
from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from alembic import context
from app.models import Base  # adjust this path to your models
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# This is the Alembic Config object, which provides access to the .ini file values.
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# Set the Alembic database URL from env var
alembic_url = os.getenv("ALEMBIC_DATABASE_URL")
if alembic_url:
    config.set_main_option("sqlalchemy.url", alembic_url)

# Target metadata for autogeneration
target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = create_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()