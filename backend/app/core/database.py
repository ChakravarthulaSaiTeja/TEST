from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize database variables
engine = None
SessionLocal = None
Base = declarative_base()


def init_database():
    """Initialize Neon.tech PostgreSQL connection if available"""
    global engine, SessionLocal

    try:
        # Try to create database engine with PostgreSQL
        engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            pool_recycle=300,
        )

        # Test connection
        with engine.connect() as conn:
            conn.execute("SELECT 1")

        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("Neon.tech PostgreSQL connection established successfully")
        return True

    except Exception as e:
        logger.warning(
            f"Neon.tech PostgreSQL connection failed: {e}. Trying SQLite fallback."
        )

        try:
            # Fallback to SQLite for development/testing
            engine = create_engine(
                settings.SQLITE_DATABASE_URL, connect_args={"check_same_thread": False}
            )

            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            logger.info("SQLite fallback database connection established successfully")
            return True

        except Exception as sqlite_error:
            logger.warning(
                f"SQLite fallback also failed: {sqlite_error}. Continuing without database."
            )
            engine = None
            SessionLocal = None
            return False


def get_db():
    """Get database session if available"""
    if SessionLocal is None:
        logger.warning("Database not available. Returning None.")
        return None

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create database tables if Neon.tech PostgreSQL is available"""
    if engine is None:
        logger.warning("Cannot create tables: Neon.tech PostgreSQL not available")
        return False

    try:
        # Import all models to ensure they are registered
        from app.models.user import User
        from app.models.portfolio import (
            Portfolio,
            Position,
            Transaction,
            Watchlist,
            WatchlistSymbol,
        )

        Base.metadata.create_all(bind=engine)
        logger.info("Neon.tech PostgreSQL tables created successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        return False


# Try to initialize database on import
init_database()
