from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from app.models.portfolio import (
    Portfolio,
    Position,
    Transaction,
    Watchlist,
    WatchlistSymbol,
)
from app.models.user import User
from app.services.market_data import MarketDataService

logger = logging.getLogger(__name__)


class PortfolioService:
    """Service for managing user portfolios and positions"""

    def __init__(self):
        self.market_data_service = MarketDataService()

    async def create_portfolio(
        self, db: Session, user_id: int, name: str, description: str = None
    ) -> Portfolio:
        """Create a new portfolio for a user"""
        try:
            # Check if this is the first portfolio (make it default)
            existing_portfolios = (
                db.query(Portfolio).filter(Portfolio.user_id == user_id).count()
            )
            is_default = existing_portfolios == 0

            portfolio = Portfolio(
                user_id=user_id,
                name=name,
                description=description,
                is_default=is_default,
            )

            db.add(portfolio)
            db.commit()
            db.refresh(portfolio)

            logger.info(f"Created portfolio '{name}' for user {user_id}")
            return portfolio

        except Exception as e:
            logger.error(f"Error creating portfolio: {e}")
            db.rollback()
            raise

    async def get_user_portfolios(self, db: Session, user_id: int) -> List[Portfolio]:
        """Get all portfolios for a user"""
        try:
            portfolios = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
            return portfolios
        except Exception as e:
            logger.error(f"Error fetching portfolios for user {user_id}: {e}")
            return []

    async def get_portfolio_details(
        self, db: Session, portfolio_id: int, user_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get detailed portfolio information with positions and P&L"""
        try:
            portfolio = (
                db.query(Portfolio)
                .filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
                .first()
            )

            if not portfolio:
                return None

            # Get positions
            positions = (
                db.query(Position).filter(Position.portfolio_id == portfolio_id).all()
            )

            # Calculate portfolio totals
            total_cost = 0
            total_market_value = 0
            total_unrealized_pnl = 0

            # Update position data with current market prices
            updated_positions = []
            for position in positions:
                # Get current market price
                market_data = await self.market_data_service.get_stock_quote(
                    position.symbol
                )
                if market_data:
                    position.current_price = market_data.get("current_price", 0)
                    position.market_value = position.quantity * position.current_price
                    position.unrealized_pnl = position.market_value - (
                        position.quantity * position.average_price
                    )
                    if position.quantity * position.average_price > 0:
                        position.unrealized_pnl_percent = (
                            position.unrealized_pnl
                            / (position.quantity * position.average_price)
                        ) * 100
                    else:
                        position.unrealized_pnl_percent = 0

                total_cost += position.quantity * position.average_price
                total_market_value += position.market_value
                total_unrealized_pnl += position.unrealized_pnl

                updated_positions.append(
                    {
                        "id": position.id,
                        "symbol": position.symbol,
                        "quantity": position.quantity,
                        "average_price": position.average_price,
                        "current_price": position.current_price,
                        "market_value": position.market_value,
                        "unrealized_pnl": position.unrealized_pnl,
                        "unrealized_pnl_percent": position.unrealized_pnl_percent,
                        "weight": (position.market_value / total_market_value * 100)
                        if total_market_value > 0
                        else 0,
                    }
                )

            # Calculate portfolio metrics
            total_return_percent = (
                (total_unrealized_pnl / total_cost * 100) if total_cost > 0 else 0
            )

            portfolio_data = {
                "id": portfolio.id,
                "name": portfolio.name,
                "description": portfolio.description,
                "is_default": portfolio.is_default,
                "created_at": portfolio.created_at,
                "updated_at": portfolio.updated_at,
                "positions": updated_positions,
                "summary": {
                    "total_cost": total_cost,
                    "total_market_value": total_market_value,
                    "total_unrealized_pnl": total_unrealized_pnl,
                    "total_return_percent": total_return_percent,
                    "position_count": len(positions),
                },
            }

            return portfolio_data

        except Exception as e:
            logger.error(f"Error fetching portfolio details: {e}")
            return None

    async def add_position(
        self,
        db: Session,
        portfolio_id: int,
        user_id: int,
        symbol: str,
        quantity: float,
        price: float,
        transaction_type: str = "buy",
    ) -> Optional[Dict[str, Any]]:
        """Add a new position or update existing position"""
        try:
            # Verify portfolio ownership
            portfolio = (
                db.query(Portfolio)
                .filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
                .first()
            )

            if not portfolio:
                raise ValueError("Portfolio not found or access denied")

            # Check if position already exists
            existing_position = (
                db.query(Position)
                .filter(
                    Position.portfolio_id == portfolio_id, Position.symbol == symbol
                )
                .first()
            )

            if existing_position:
                # Update existing position
                if transaction_type == "buy":
                    # Calculate new average price
                    total_quantity = existing_position.quantity + quantity
                    total_cost = (
                        existing_position.quantity * existing_position.average_price
                    ) + (quantity * price)
                    existing_position.average_price = total_cost / total_quantity
                    existing_position.quantity = total_quantity
                elif transaction_type == "sell":
                    # Reduce position
                    existing_position.quantity -= quantity
                    if existing_position.quantity <= 0:
                        db.delete(existing_position)
                        existing_position = None

                position = existing_position
            else:
                # Create new position
                if transaction_type == "buy":
                    position = Position(
                        portfolio_id=portfolio_id,
                        symbol=symbol,
                        quantity=quantity,
                        average_price=price,
                    )
                    db.add(position)
                else:
                    raise ValueError("Cannot sell shares you don't own")

            # Record transaction
            transaction = Transaction(
                portfolio_id=portfolio_id,
                symbol=symbol,
                transaction_type=transaction_type,
                quantity=quantity,
                price=price,
                total_amount=quantity * price,
                transaction_date=datetime.now(),
            )
            db.add(transaction)

            db.commit()

            if position:
                db.refresh(position)
                return {
                    "id": position.id,
                    "symbol": position.symbol,
                    "quantity": position.quantity,
                    "average_price": position.average_price,
                }
            else:
                return {"message": "Position closed"}

        except Exception as e:
            logger.error(f"Error adding position: {e}")
            db.rollback()
            raise

    async def create_watchlist(
        self, db: Session, user_id: int, name: str, description: str = None
    ) -> Watchlist:
        """Create a new watchlist for a user"""
        try:
            # Check if this is the first watchlist (make it default)
            existing_watchlists = (
                db.query(Watchlist).filter(Watchlist.user_id == user_id).count()
            )
            is_default = existing_watchlists == 0

            watchlist = Watchlist(
                user_id=user_id,
                name=name,
                description=description,
                is_default=is_default,
            )

            db.add(watchlist)
            db.commit()
            db.refresh(watchlist)

            logger.info(f"Created watchlist '{name}' for user {user_id}")
            return watchlist

        except Exception as e:
            logger.error(f"Error creating watchlist: {e}")
            db.rollback()
            raise

    async def add_to_watchlist(
        self,
        db: Session,
        watchlist_id: int,
        user_id: int,
        symbol: str,
        notes: str = None,
    ) -> WatchlistSymbol:
        """Add a symbol to a watchlist"""
        try:
            # Verify watchlist ownership
            watchlist = (
                db.query(Watchlist)
                .filter(Watchlist.id == watchlist_id, Watchlist.user_id == user_id)
                .first()
            )

            if not watchlist:
                raise ValueError("Watchlist not found or access denied")

            # Check if symbol already exists
            existing_symbol = (
                db.query(WatchlistSymbol)
                .filter(
                    WatchlistSymbol.watchlist_id == watchlist_id,
                    WatchlistSymbol.symbol == symbol,
                )
                .first()
            )

            if existing_symbol:
                raise ValueError("Symbol already in watchlist")

            # Add symbol to watchlist
            watchlist_symbol = WatchlistSymbol(
                watchlist_id=watchlist_id, symbol=symbol, notes=notes
            )

            db.add(watchlist_symbol)
            db.commit()
            db.refresh(watchlist_symbol)

            logger.info(f"Added {symbol} to watchlist {watchlist_id}")
            return watchlist_symbol

        except Exception as e:
            logger.error(f"Error adding to watchlist: {e}")
            db.rollback()
            raise

    async def get_watchlist_details(
        self, db: Session, watchlist_id: int, user_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get watchlist details with current market data"""
        try:
            watchlist = (
                db.query(Watchlist)
                .filter(Watchlist.id == watchlist_id, Watchlist.user_id == user_id)
                .first()
            )

            if not watchlist:
                return None

            # Get symbols
            symbols = (
                db.query(WatchlistSymbol)
                .filter(WatchlistSymbol.watchlist_id == watchlist_id)
                .all()
            )

            # Get current market data for each symbol
            watchlist_data = []
            for symbol_data in symbols:
                market_data = await self.market_data_service.get_stock_quote(
                    symbol_data.symbol
                )

                watchlist_data.append(
                    {
                        "id": symbol_data.id,
                        "symbol": symbol_data.symbol,
                        "notes": symbol_data.notes,
                        "added_at": symbol_data.added_at,
                        "current_price": market_data.get("current_price", 0),
                        "change": market_data.get("change", 0),
                        "change_percent": market_data.get("change_percent", 0),
                        "volume": market_data.get("volume", 0),
                    }
                )

            return {
                "id": watchlist.id,
                "name": watchlist.name,
                "description": watchlist.description,
                "is_default": watchlist.is_default,
                "created_at": watchlist.created_at,
                "symbols": watchlist_data,
            }

        except Exception as e:
            logger.error(f"Error fetching watchlist details: {e}")
            return None

    async def get_portfolio_performance(
        self, db: Session, portfolio_id: int, user_id: int, period: str = "1y"
    ) -> Optional[Dict[str, Any]]:
        """Get portfolio performance over time"""
        try:
            # Verify portfolio ownership
            portfolio = (
                db.query(Portfolio)
                .filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
                .first()
            )

            if not portfolio:
                return None

            # Get all positions
            positions = (
                db.query(Position).filter(Position.portfolio_id == portfolio_id).all()
            )

            if not positions:
                return {"message": "No positions in portfolio"}

            # Calculate daily portfolio value (simplified - would need historical data for accuracy)
            performance_data = {
                "portfolio_id": portfolio_id,
                "period": period,
                "positions": [],
                "total_value": 0,
                "total_cost": 0,
                "total_pnl": 0,
            }

            for position in positions:
                # Get historical data for the symbol
                hist_data = await self.market_data_service.get_stock_history(
                    position.symbol, period
                )

                if hist_data:
                    # Calculate position performance
                    current_price = (
                        hist_data[-1]["close"] if hist_data else position.average_price
                    )
                    market_value = position.quantity * current_price
                    cost_basis = position.quantity * position.average_price
                    pnl = market_value - cost_basis

                    performance_data["positions"].append(
                        {
                            "symbol": position.symbol,
                            "quantity": position.quantity,
                            "cost_basis": cost_basis,
                            "current_value": market_value,
                            "pnl": pnl,
                            "pnl_percent": (pnl / cost_basis * 100)
                            if cost_basis > 0
                            else 0,
                        }
                    )

                    performance_data["total_value"] += market_value
                    performance_data["total_cost"] += cost_basis
                    performance_data["total_pnl"] += pnl

            if performance_data["total_cost"] > 0:
                performance_data["total_pnl_percent"] = (
                    performance_data["total_pnl"] / performance_data["total_cost"]
                ) * 100
            else:
                performance_data["total_pnl_percent"] = 0

            return performance_data

        except Exception as e:
            logger.error(f"Error calculating portfolio performance: {e}")
            return None
