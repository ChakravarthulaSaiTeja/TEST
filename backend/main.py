from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    Depends,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import asyncio
import json
import logging
from typing import List, Dict, Any
import uvicorn
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.websocket import ConnectionManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# WebSocket connection manager
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Trading Intelligence Platform Backend...")

    # Try to connect to Redis if available
    try:
        from app.core.cache import redis_client

        await redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Continuing without Redis.")

    yield

    # Shutdown
    logger.info("Shutting down Trading Intelligence Platform Backend...")
    try:
        from app.core.cache import redis_client

        await redis_client.close()
        logger.info("Redis connection closed")
    except Exception as e:
        logger.warning(f"Error closing Redis connection: {e}")


app = FastAPI(
    title="Trading Intelligence Platform API",
    description="AI-powered trading intelligence platform with real-time market data, ML predictions, and sentiment analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.yourdomain.com"],
)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response


# Include API routes
try:
    from app.api.v1.api import api_router

    app.include_router(api_router, prefix="/api/v1")
    logger.info("API routes loaded successfully")
except Exception as e:
    logger.warning(f"Failed to load API routes: {e}")


# WebSocket endpoint for real-time updates
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Send real-time market data
            data = await websocket.receive_text()

            # Validate JSON input
            try:
                message = json.loads(data)
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON received from client {client_id}: {e}")
                await websocket.send_text(
                    json.dumps({"type": "error", "message": "Invalid JSON format"})
                )
                continue

            # Validate message structure
            if not isinstance(message, dict) or "type" not in message:
                logger.warning(f"Invalid message structure from client {client_id}")
                await websocket.send_text(
                    json.dumps(
                        {"type": "error", "message": "Invalid message structure"}
                    )
                )
                continue

            if message.get("type") == "subscribe":
                # Handle subscription to specific symbols
                symbols = message.get("symbols", [])
                if not isinstance(symbols, list):
                    logger.warning(f"Invalid symbols format from client {client_id}")
                    await websocket.send_text(
                        json.dumps(
                            {"type": "error", "message": "Symbols must be a list"}
                        )
                    )
                    continue
                await manager.subscribe_client(client_id, symbols)

            elif message.get("type") == "ping":
                # Respond to ping with pong
                await websocket.send_text(json.dumps({"type": "pong"}))
            else:
                logger.warning(
                    f"Unknown message type from client {client_id}: {message.get('type')}"
                )
                await websocket.send_text(
                    json.dumps({"type": "error", "message": "Unknown message type"})
                )

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
        manager.disconnect(client_id)


# Health check endpoint
@app.get("/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "service": "Trading Intelligence Platform Backend",
        "version": "1.0.0",
    }


# Root endpoint
@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {
        "message": "Trading Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
