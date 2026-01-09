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

# Security middleware - Commented out to allow all hosts for development
# app.add_middleware(
#     TrustedHostMiddleware,
#     allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.yourdomain.com"],
# )


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


# Direct stock endpoints (bypass router) - MUST be before router inclusion
@app.get("/stocks/{symbol}")
async def get_stock_direct(symbol: str):
    """Direct stock endpoint to bypass router issues"""
    try:
        from app.services.market_data import MarketDataService
        import urllib.parse
        
        symbol = urllib.parse.unquote(symbol)
        market_service = MarketDataService()
        stock_info = await market_service.get_stock_info(symbol)
        
        if not stock_info:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Stock data not found for symbol: {symbol}")
        
        return stock_info
    except Exception as e:
        logger.error(f"Error in direct stock endpoint for {symbol}: {e}", exc_info=True)
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")


@app.get("/stocks/{symbol}/history")
async def get_stock_history_direct(symbol: str, period: str = "1mo", interval: str = "1d"):
    """Direct stock history endpoint"""
    try:
        from fastapi import Query
        import urllib.parse
        import yfinance as yf
        
        symbol = urllib.parse.unquote(symbol)
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"No historical data found for symbol {symbol}")
        
        chart_data = {
            "symbol": symbol,
            "period": period,
            "interval": interval,
            "labels": hist.index.strftime("%Y-%m-%d").tolist(),
            "datasets": [
                {
                    "label": "Price",
                    "data": hist["Close"].tolist(),
                    "borderColor": "#3b82f6",
                    "backgroundColor": "rgba(59, 130, 246, 0.1)",
                    "fill": True,
                    "tension": 0.4,
                    "pointRadius": 0,
                    "hoverRadius": 6,
                    "borderWidth": 2,
                },
            ],
            "metadata": {
                "current_price": float(hist["Close"].iloc[-1]) if not hist.empty else 0,
                "price_change": float(hist["Close"].iloc[-1] - hist["Close"].iloc[0]) if len(hist) > 1 else 0,
                "price_change_percent": float(((hist["Close"].iloc[-1] - hist["Close"].iloc[0]) / hist["Close"].iloc[0]) * 100) if len(hist) > 1 and hist["Close"].iloc[0] != 0 else 0,
                "volume": int(hist["Volume"].iloc[-1]) if not hist.empty else 0,
                "high_52w": float(hist["High"].max()) if not hist.empty else 0,
                "low_52w": float(hist["Low"].min()) if not hist.empty else 0,
            },
        }
        return chart_data
    except Exception as e:
        logger.error(f"Error in direct history endpoint for {symbol}: {e}", exc_info=True)
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to fetch historical data: {str(e)}")


# Include API routes
try:
    from app.api.v1.api import api_router

    app.include_router(api_router, prefix="/api/v1")
    logger.info("API routes loaded successfully")
    # Log route count for debugging
    route_count = len([r for r in app.routes if hasattr(r, 'path')])
    stock_route_count = len([r for r in app.routes if hasattr(r, 'path') and 'stock' in r.path.lower()])
    logger.info(f"Total routes registered: {route_count}, Stock routes: {stock_route_count}")
except Exception as e:
    logger.error(f"Failed to load API routes: {e}", exc_info=True)
    raise  # Re-raise to prevent server from starting without routes


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

# Simple stock proxy endpoint (test if this works)
@app.get("/stock/{symbol}")
async def get_stock_simple(symbol: str):
    """Simple stock endpoint without rate limiter"""
    try:
        from app.services.market_data import MarketDataService
        import urllib.parse
        
        symbol = urllib.parse.unquote(symbol)
        market_service = MarketDataService()
        stock_info = await market_service.get_stock_info(symbol)
        
        if not stock_info:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Stock data not found for symbol: {symbol}")
        
        return stock_info
    except Exception as e:
        logger.error(f"Error in simple stock endpoint for {symbol}: {e}", exc_info=True)
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")


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
