from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import asyncio
import json
import logging
from typing import List, Dict, Any
import uvicorn

from app.core.config import settings
from app.core.websocket import ConnectionManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    except:
        pass


app = FastAPI(
    title="Trading Intelligence Platform API",
    description="AI-powered trading intelligence platform with real-time market data, ML predictions, and sentiment analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            message = json.loads(data)

            if message.get("type") == "subscribe":
                # Handle subscription to specific symbols
                symbols = message.get("symbols", [])
                await manager.subscribe_client(client_id, symbols)

            elif message.get("type") == "ping":
                # Respond to ping with pong
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(client_id)


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Trading Intelligence Platform Backend",
        "version": "1.0.0",
    }


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Trading Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
