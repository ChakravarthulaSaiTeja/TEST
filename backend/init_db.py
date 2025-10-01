#!/usr/bin/env python3
"""
Database initialization script
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.core.config import settings
from app.models.user import User
from app.models.portfolio import (
    Portfolio,
    Position,
    Transaction,
    Watchlist,
    WatchlistSymbol,
)
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_database():
    """Initialize SQLite database with all tables"""
    try:
        # Create SQLite engine
        engine = create_engine(
            settings.SQLITE_DATABASE_URL, connect_args={"check_same_thread": False}
        )

        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")

        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()

        # Check if we have any users
        user_count = db.query(User).count()
        logger.info(f"Found {user_count} existing users")

        db.close()
        return True

    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        return False


if __name__ == "__main__":
    success = init_database()
    if success:
        print("✅ Database initialized successfully!")
    else:
        print("❌ Database initialization failed!")
        sys.exit(1)
