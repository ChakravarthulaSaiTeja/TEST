import redis.asyncio as redis
import json
import logging
from typing import Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Redis client
redis_client = None


def init_redis():
    """Initialize Redis connection if available"""
    global redis_client

    try:
        redis_client = redis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True
        )
        logger.info("Redis connection established successfully")
        return True
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Continuing without Redis.")
        redis_client = None
        return False


class CacheManager:
    """Cache manager that works with or without Redis"""

    def __init__(self):
        self._cache = {}  # Fallback in-memory cache
        self._redis_available = redis_client is not None

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if self._redis_available:
            try:
                value = await redis_client.get(key)
                if value:
                    return json.loads(value)
            except Exception as e:
                logger.warning(f"Redis get failed: {e}")

        # Fallback to in-memory cache
        return self._cache.get(key)

    async def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """Set value in cache"""
        if self._redis_available:
            try:
                await redis_client.setex(key, expire, json.dumps(value))
                return True
            except Exception as e:
                logger.warning(f"Redis set failed: {e}")

        # Fallback to in-memory cache
        self._cache[key] = value
        return True

    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        if self._redis_available:
            try:
                await redis_client.delete(key)
                return True
            except Exception as e:
                logger.warning(f"Redis delete failed: {e}")

        # Fallback to in-memory cache
        if key in self._cache:
            del self._cache[key]
            return True
        return False

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if self._redis_available:
            try:
                return await redis_client.exists(key) > 0
            except Exception as e:
                logger.warning(f"Redis exists failed: {e}")

        # Fallback to in-memory cache
        return key in self._cache

    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration for key"""
        if self._redis_available:
            try:
                return await redis_client.expire(key, seconds)
            except Exception as e:
                logger.warning(f"Redis expire failed: {e}")

        # Fallback to in-memory cache (no expiration support)
        return True


# Initialize Redis on import
init_redis()

# Create cache manager instance
cache_manager = CacheManager()
