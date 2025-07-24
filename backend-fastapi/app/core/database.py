import os
from typing import AsyncGenerator
import logging

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, AsyncEngine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create async engine with Docker PostgreSQL connection
database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/car_rental_db")
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine: AsyncEngine = create_async_engine(
    database_url,
    echo=settings.LOG_LEVEL == "DEBUG",
    future=True,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "server_settings": {
            "application_name": "car_rental_dapp",
        }
    }
)

# Create async session maker
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables() -> None:
    """Create database tables"""
    try:
        async with engine.begin() as conn:
            # Import only user model (blockchain-only for contracts)
            from app.models import user
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


async def init_db() -> None:
    """Initialize database - alias for create_tables"""
    await create_tables()


async def test_connection() -> bool:
    """Test database connection"""
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            return result.scalar() == 1
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
