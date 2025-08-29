from fastapi import WebSocket
from typing import Dict, List, Set
import json
import logging
import asyncio

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Active connections: client_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Client subscriptions: client_id -> set of symbols
        self.client_subscriptions: Dict[str, Set[str]] = {}
        # Symbol subscribers: symbol -> set of client_ids
        self.symbol_subscribers: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new client"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.client_subscriptions[client_id] = set()
        logger.info(f"Client {client_id} connected")

    def disconnect(self, client_id: str):
        """Disconnect a client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]

        # Remove from subscriptions
        if client_id in self.client_subscriptions:
            # Remove client from all symbol subscriber lists
            for symbol in self.client_subscriptions[client_id]:
                if symbol in self.symbol_subscribers:
                    self.symbol_subscribers[symbol].discard(client_id)
                    # Clean up empty symbol lists
                    if not self.symbol_subscribers[symbol]:
                        del self.symbol_subscribers[symbol]

            del self.client_subscriptions[client_id]

        logger.info(f"Client {client_id} disconnected")

    async def subscribe_client(self, client_id: str, symbols: List[str]):
        """Subscribe a client to specific symbols"""
        if client_id not in self.active_connections:
            return

        # Update client subscriptions
        self.client_subscriptions[client_id].update(symbols)

        # Update symbol subscribers
        for symbol in symbols:
            if symbol not in self.symbol_subscribers:
                self.symbol_subscribers[symbol] = set()
            self.symbol_subscribers[symbol].add(client_id)

        # Send confirmation
        await self.send_personal_message(
            client_id,
            {
                "type": "subscription_confirmed",
                "symbols": symbols,
                "message": f"Subscribed to {len(symbols)} symbols",
            },
        )

        logger.info(f"Client {client_id} subscribed to {symbols}")

    async def send_personal_message(self, client_id: str, message: dict):
        """Send message to specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)

    async def broadcast_to_symbol(self, symbol: str, message: dict):
        """Broadcast message to all clients subscribed to a symbol"""
        if symbol in self.symbol_subscribers:
            disconnected_clients = []

            for client_id in self.symbol_subscribers[symbol]:
                try:
                    await self.active_connections[client_id].send_text(
                        json.dumps(message)
                    )
                except Exception as e:
                    logger.error(f"Error broadcasting to {client_id}: {e}")
                    disconnected_clients.append(client_id)

            # Clean up disconnected clients
            for client_id in disconnected_clients:
                self.disconnect(client_id)

    async def broadcast_market_update(self, symbol: str, data: dict):
        """Broadcast market data update to subscribed clients"""
        message = {
            "type": "market_update",
            "symbol": symbol,
            "data": data,
            "timestamp": asyncio.get_event_loop().time(),
        }
        await self.broadcast_to_symbol(symbol, message)

    async def broadcast_prediction_update(self, symbol: str, data: dict):
        """Broadcast prediction update to subscribed clients"""
        message = {
            "type": "prediction_update",
            "symbol": symbol,
            "data": data,
            "timestamp": asyncio.get_event_loop().time(),
        }
        await self.broadcast_to_symbol(symbol, message)

    async def broadcast_sentiment_update(self, symbol: str, data: dict):
        """Broadcast sentiment update to subscribed clients"""
        message = {
            "type": "sentiment_update",
            "symbol": symbol,
            "data": data,
            "timestamp": asyncio.get_event_loop().time(),
        }
        await self.broadcast_to_symbol(symbol, message)

    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)

    def get_subscription_stats(self) -> dict:
        """Get subscription statistics"""
        return {
            "total_connections": len(self.active_connections),
            "total_symbols": len(self.symbol_subscribers),
            "symbol_subscribers": {
                symbol: len(subscribers)
                for symbol, subscribers in self.symbol_subscribers.items()
            },
        }
