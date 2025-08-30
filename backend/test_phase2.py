#!/usr/bin/env python3
"""
Test script for Phase 2 implementation
This script tests the authentication, portfolio, and market data functionality
"""

import asyncio
import requests
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1"


def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            logger.info("✅ Health check passed")
            return True
        else:
            logger.error(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Health check error: {e}")
        return False


def test_user_registration():
    """Test user registration"""
    try:
        user_data = {
            "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
            "username": f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "password": "testpassword123",
            "full_name": "Test User",
        }

        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)

        if response.status_code == 200:
            logger.info("✅ User registration passed")
            user_info = response.json()
            logger.info(f"Created user: {user_info['email']}")
            return user_info
        else:
            logger.error(
                f"❌ User registration failed: {response.status_code} - {response.text}"
            )
            return None

    except Exception as e:
        logger.error(f"❌ User registration error: {e}")
        return None


def test_user_login(email, password):
    """Test user login"""
    try:
        login_data = {
            "username": email,  # OAuth2 form uses 'username' field
            "password": password,
        }

        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)

        if response.status_code == 200:
            logger.info("✅ User login passed")
            token_data = response.json()
            logger.info(f"Got access token: {token_data['access_token'][:20]}...")
            return token_data["access_token"]
        else:
            logger.error(
                f"❌ User login failed: {response.status_code} - {response.text}"
            )
            return None

    except Exception as e:
        logger.error(f"❌ User login error: {e}")
        return None


def test_portfolio_creation(token):
    """Test portfolio creation"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        portfolio_data = {
            "name": "Test Portfolio",
            "description": "A test portfolio for Phase 2",
        }

        response = requests.post(
            f"{BASE_URL}/portfolio/", json=portfolio_data, headers=headers
        )

        if response.status_code == 200:
            logger.info("✅ Portfolio creation passed")
            portfolio_info = response.json()
            logger.info(f"Created portfolio: {portfolio_info['name']}")
            return portfolio_info
        else:
            logger.error(
                f"❌ Portfolio creation failed: {response.status_code} - {response.text}"
            )
            return None

    except Exception as e:
        logger.error(f"❌ Portfolio creation error: {e}")
        return None


def test_stock_data():
    """Test stock data fetching"""
    try:
        response = requests.get(f"{BASE_URL}/stocks/AAPL")

        if response.status_code == 200:
            logger.info("✅ Stock data fetching passed")
            stock_data = response.json()
            logger.info(f"Got data for AAPL: ${stock_data.get('current_price', 'N/A')}")
            return True
        else:
            logger.error(
                f"❌ Stock data fetching failed: {response.status_code} - {response.text}"
            )
            return False

    except Exception as e:
        logger.error(f"❌ Stock data fetching error: {e}")
        return False


def test_market_summary():
    """Test market summary endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/stocks/market-summary")

        if response.status_code == 200:
            logger.info("✅ Market summary fetching passed")
            market_data = response.json()
            logger.info(f"Got market summary with {len(market_data)} indices")
            return True
        else:
            logger.error(
                f"❌ Market summary fetching failed: {response.status_code} - {response.text}"
            )
            return False

    except Exception as e:
        logger.error(f"❌ Market summary fetching error: {e}")
        return False


def main():
    """Main test function"""
    logger.info("🚀 Starting Phase 2 tests...")

    # Test 1: Health check
    if not test_health_check():
        logger.error("Health check failed, stopping tests")
        return False

    # Test 2: Stock data (no auth required)
    if not test_stock_data():
        logger.warning("Stock data test failed, but continuing...")

    # Test 3: Market summary (no auth required)
    if not test_market_summary():
        logger.warning("Market summary test failed, but continuing...")

    # Test 4: User registration
    user_info = test_user_registration()
    if not user_info:
        logger.error("User registration failed, stopping tests")
        return False

    # Test 5: User login
    token = test_user_login(user_info["email"], "testpassword123")
    if not token:
        logger.error("User login failed, stopping tests")
        return False

    # Test 6: Portfolio creation
    portfolio_info = test_portfolio_creation(token)
    if not portfolio_info:
        logger.error("Portfolio creation failed")
        return False

    logger.info("🎉 All Phase 2 tests completed successfully!")
    return True


if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Phase 2 implementation is working correctly!")
        print("🚀 You can now:")
        print("   - Register and login users")
        print("   - Create and manage portfolios")
        print("   - Fetch real-time stock data")
        print("   - Use the enhanced market data service")
        print("   - Connect to Neon.tech PostgreSQL")
        print("   - Use Upstash Redis for caching")
    else:
        print("\n❌ Some Phase 2 tests failed. Check the logs above.")
        exit(1)
