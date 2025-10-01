#!/usr/bin/env python3
"""
Database migration script to add membership columns
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def migrate_database():
    """Add membership columns to existing database"""
    try:
        # Create SQLite engine
        engine = create_engine(
            settings.SQLITE_DATABASE_URL, connect_args={"check_same_thread": False}
        )

        # List of new columns to add
        new_columns = [
            "ALTER TABLE users ADD COLUMN membership_type VARCHAR(20) DEFAULT 'free'",
            "ALTER TABLE users ADD COLUMN membership_start_date DATETIME",
            "ALTER TABLE users ADD COLUMN membership_end_date DATETIME",
            "ALTER TABLE users ADD COLUMN subscription_id VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN payment_method VARCHAR(50)",
            "ALTER TABLE users ADD COLUMN billing_cycle VARCHAR(20) DEFAULT 'monthly'",
            "ALTER TABLE users ADD COLUMN auto_renew BOOLEAN DEFAULT 1",
            "ALTER TABLE users ADD COLUMN api_calls_limit INTEGER DEFAULT 100",
            "ALTER TABLE users ADD COLUMN portfolio_limit INTEGER DEFAULT 1",
            "ALTER TABLE users ADD COLUMN watchlist_limit INTEGER DEFAULT 3",
            "ALTER TABLE users ADD COLUMN prediction_limit INTEGER DEFAULT 10",
            "ALTER TABLE users ADD COLUMN has_advanced_charts BOOLEAN DEFAULT 0",
            "ALTER TABLE users ADD COLUMN has_real_time_data BOOLEAN DEFAULT 0",
            "ALTER TABLE users ADD COLUMN has_ai_predictions BOOLEAN DEFAULT 0",
            "ALTER TABLE users ADD COLUMN has_portfolio_analytics BOOLEAN DEFAULT 0",
            "ALTER TABLE users ADD COLUMN has_custom_alerts BOOLEAN DEFAULT 0",
        ]

        with engine.connect() as conn:
            for column_sql in new_columns:
                try:
                    conn.execute(text(column_sql))
                    logger.info(f"Added column: {column_sql}")
                except Exception as e:
                    if "duplicate column name" in str(e).lower():
                        logger.info(f"Column already exists: {column_sql}")
                    else:
                        logger.warning(f"Failed to add column {column_sql}: {e}")

            conn.commit()

        logger.info("Database migration completed successfully")
        return True

    except Exception as e:
        logger.error(f"Failed to migrate database: {e}")
        return False


if __name__ == "__main__":
    success = migrate_database()
    if success:
        print("✅ Database migration completed successfully!")
    else:
        print("❌ Database migration failed!")
        sys.exit(1)
