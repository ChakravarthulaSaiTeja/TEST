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
    """Initialize database connection if available"""
    global engine, SessionLocal

    try:
        # Try to create database engine
        engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            pool_recycle=300,
        )

        # Test connection
        with engine.connect() as conn:
            conn.execute("SELECT 1")

        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("Database connection established successfully")
        return True

    except Exception as e:
        logger.warning(f"Database connection failed: {e}. Continuing without database.")
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
    """Create database tables if database is available"""
    if engine is None:
        logger.warning("Cannot create tables: database not available")
        return False

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        return False


# Try to initialize database on import
init_database()
