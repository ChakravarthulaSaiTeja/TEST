#!/usr/bin/env python3
"""
Database initialization script for Phase 2
This script creates all necessary tables and optionally adds sample data
"""

import asyncio
import logging
from sqlalchemy.orm import Session

from app.core.database import init_database, create_tables, SessionLocal
from app.models.user import User
from app.models.portfolio import (
    Portfolio,
    Position,
    Transaction,
    Watchlist,
    WatchlistSymbol,
)
from app.api.v1.endpoints.auth import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_sample_data(db: Session):
    """Create sample data for testing"""
    try:
        # Check if sample user already exists
        existing_user = db.query(User).filter(User.email == "demo@example.com").first()
        if existing_user:
            logger.info("Sample user already exists, skipping sample data creation")
            return

        # Create sample user
        sample_user = User(
            email="demo@example.com",
            username="demo_user",
            full_name="Demo User",
            hashed_password=get_password_hash("demo123"),
            is_active=True,
            is_verified=True,
        )
        db.add(sample_user)
        db.commit()
        db.refresh(sample_user)
        logger.info(f"Created sample user: {sample_user.email}")

        # Create sample portfolio
        sample_portfolio = Portfolio(
            user_id=sample_user.id,
            name="My First Portfolio",
            description="A sample portfolio for demonstration",
            is_default=True,
        )
        db.add(sample_portfolio)
        db.commit()
        db.refresh(sample_portfolio)
        logger.info(f"Created sample portfolio: {sample_portfolio.name}")

        # Create sample watchlist
        sample_watchlist = Watchlist(
            user_id=sample_user.id,
            name="My Watchlist",
            description="Stocks I'm watching",
            is_default=True,
        )
        db.add(sample_watchlist)
        db.commit()
        db.refresh(sample_watchlist)
        logger.info(f"Created sample watchlist: {sample_watchlist.name}")

        # Add some sample symbols to watchlist
        sample_symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]
        for symbol in sample_symbols:
            watchlist_symbol = WatchlistSymbol(
                watchlist_id=sample_watchlist.id,
                symbol=symbol,
                notes=f"Watching {symbol}",
            )
            db.add(watchlist_symbol)

        db.commit()
        logger.info(f"Added {len(sample_symbols)} symbols to watchlist")

        logger.info("Sample data created successfully!")

    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
        db.rollback()


def main():
    """Main initialization function"""
    logger.info("Starting Neon.tech PostgreSQL initialization...")

    # Initialize database connection
    if not init_database():
        logger.error("Failed to initialize Neon.tech PostgreSQL connection")
        return False

    # Create tables
    if not create_tables():
        logger.error("Failed to create database tables")
        return False

    logger.info("Neon.tech PostgreSQL tables created successfully!")

    # Create sample data
    try:
        db = SessionLocal()
        create_sample_data(db)
        db.close()
    except Exception as e:
        logger.warning(f"Failed to create sample data: {e}")

    logger.info("Neon.tech PostgreSQL initialization completed!")
    return True


if __name__ == "__main__":
    success = main()
    if success:
        print("✅ Database initialized successfully!")
    else:
        print("❌ Database initialization failed!")
        exit(1)
