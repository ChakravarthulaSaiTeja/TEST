from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_active_user
from app.models.user import User
from app.services.portfolio_service import PortfolioService
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioResponse,
    PositionCreate,
    WatchlistCreate,
    WatchlistSymbolCreate,
)

router = APIRouter()
portfolio_service = PortfolioService()


@router.post("/", response_model=PortfolioResponse)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new portfolio"""
    try:
        portfolio = await portfolio_service.create_portfolio(
            db=db,
            user_id=current_user.id,
            name=portfolio_data.name,
            description=portfolio_data.description,
        )

        return PortfolioResponse(
            id=portfolio.id,
            user_id=portfolio.user_id,
            name=portfolio.name,
            description=portfolio.description,
            is_default=portfolio.is_default,
            created_at=portfolio.created_at,
            updated_at=portfolio.updated_at,
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[PortfolioResponse])
async def get_user_portfolios(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get all portfolios for the current user"""
    try:
        portfolios = await portfolio_service.get_user_portfolios(db, current_user.id)

        return [
            PortfolioResponse(
                id=p.id,
                user_id=p.user_id,
                name=p.name,
                description=p.description,
                is_default=p.is_default,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
            for p in portfolios
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch portfolios: {str(e)}"
        )


@router.get("/{portfolio_id}")
async def get_portfolio_details(
    portfolio_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get detailed portfolio information with positions and P&L"""
    try:
        portfolio_data = await portfolio_service.get_portfolio_details(
            db, portfolio_id, current_user.id
        )

        if not portfolio_data:
            raise HTTPException(status_code=404, detail="Portfolio not found")

        return portfolio_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch portfolio: {str(e)}"
        )


@router.post("/{portfolio_id}/positions")
async def add_position(
    portfolio_id: int,
    position_data: PositionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Add a new position or update existing position"""
    try:
        result = await portfolio_service.add_position(
            db=db,
            portfolio_id=portfolio_id,
            user_id=current_user.id,
            symbol=position_data.symbol,
            quantity=position_data.quantity,
            price=position_data.price,
            transaction_type=position_data.transaction_type,
        )

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add position: {str(e)}")


@router.get("/{portfolio_id}/performance")
async def get_portfolio_performance(
    portfolio_id: int,
    period: str = Query("1y", description="Performance period"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get portfolio performance over time"""
    try:
        performance = await portfolio_service.get_portfolio_performance(
            db, portfolio_id, current_user.id, period
        )

        if not performance:
            raise HTTPException(status_code=404, detail="Portfolio not found")

        return performance

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch performance: {str(e)}"
        )


# Watchlist endpoints
@router.post("/watchlists", response_model=dict)
async def create_watchlist(
    watchlist_data: WatchlistCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new watchlist"""
    try:
        watchlist = await portfolio_service.create_watchlist(
            db=db,
            user_id=current_user.id,
            name=watchlist_data.name,
            description=watchlist_data.description,
        )

        return {
            "id": watchlist.id,
            "name": watchlist.name,
            "description": watchlist.description,
            "is_default": watchlist.is_default,
            "created_at": watchlist.created_at,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/watchlists")
async def get_user_watchlists(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get all watchlists for the current user"""
    try:
        # This would need to be implemented in the service
        # For now, return a placeholder
        return {"message": "Watchlist endpoints - to be implemented"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch watchlists: {str(e)}"
        )


@router.post("/watchlists/{watchlist_id}/symbols")
async def add_to_watchlist(
    watchlist_id: int,
    symbol_data: WatchlistSymbolCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Add a symbol to a watchlist"""
    try:
        watchlist_symbol = await portfolio_service.add_to_watchlist(
            db=db,
            watchlist_id=watchlist_id,
            user_id=current_user.id,
            symbol=symbol_data.symbol,
            notes=symbol_data.notes,
        )

        return {
            "id": watchlist_symbol.id,
            "symbol": watchlist_symbol.symbol,
            "notes": watchlist_symbol.notes,
            "added_at": watchlist_symbol.added_at,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to add to watchlist: {str(e)}"
        )


@router.get("/watchlists/{watchlist_id}")
async def get_watchlist_details(
    watchlist_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get watchlist details with current market data"""
    try:
        watchlist_data = await portfolio_service.get_watchlist_details(
            db, watchlist_id, current_user.id
        )

        if not watchlist_data:
            raise HTTPException(status_code=404, detail="Watchlist not found")

        return watchlist_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch watchlist: {str(e)}"
        )
