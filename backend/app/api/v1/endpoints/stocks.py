from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import logging

from app.core.cache import cache_manager
from app.services.market_data import MarketDataService
from app.services.technical_analysis import TechnicalAnalysisService
from app.schemas.stock import StockData, TechnicalIndicators, StockAnalysis

logger = logging.getLogger(__name__)

router = APIRouter()
market_data_service = MarketDataService()
technical_analysis_service = TechnicalAnalysisService()


@router.get("/{symbol}")
async def get_stock_data(symbol: str) -> StockData:
    """Get current stock data for a symbol"""
    try:
        # Try to get from cache first
        cache_key = f"stock_data_{symbol.lower()}"
        cached_data = await cache_manager.get(cache_key)

        if cached_data:
            return StockData(**cached_data)

        # Fetch fresh data
        stock_info = await market_data_service.get_stock_info(symbol)

        # Cache the data
        await cache_manager.set(cache_key, stock_info, expire=60)

        return stock_info

    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch stock data: {str(e)}"
        )


@router.get("/{symbol}/analysis")
async def get_stock_analysis(symbol: str) -> StockAnalysis:
    """Get comprehensive stock analysis including technical indicators"""
    try:
        # Try to get from cache first
        cache_key = f"stock_analysis_{symbol.lower()}"
        cached_analysis = await cache_manager.get(cache_key)

        if cached_analysis:
            return StockAnalysis(**cached_analysis)

        # Get stock data
        stock_data = await get_stock_data(symbol)

        # Get technical indicators
        indicators = await technical_analysis_service.calculate_indicators(symbol)

        # Create analysis
        analysis = StockAnalysis(
            symbol=symbol,
            current_price=stock_data.current_price,
            change=stock_data.change,
            change_percent=stock_data.change_percent,
            volume=stock_data.volume,
            market_cap=stock_data.market_cap,
            pe_ratio=stock_data.pe_ratio,
            technical_indicators=indicators,
            recommendation=indicators.recommendation,
            confidence_score=indicators.confidence_score,
            last_updated=datetime.now(),
        )

        # Cache the analysis
        await cache_manager.set(cache_key, analysis.model_dump(), expire=300)

        return analysis

    except Exception as e:
        logger.error(f"Error analyzing stock {symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze stock: {str(e)}"
        )


@router.get("/{symbol}/history")
async def get_stock_history(
    symbol: str,
    period: str = Query(
        "1y",
        description="Data period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max",
    ),
    interval: str = Query(
        "1d",
        description="Data interval: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo",
    ),
) -> List[Dict[str, Any]]:
    """Get historical stock data"""
    try:
        # Try to get from cache first
        cache_key = f"stock_history_{symbol.lower()}_{period}_{interval}"
        cached_history = await cache_manager.get(cache_key)

        if cached_history:
            return cached_history

        # Fetch historical data
        history_data = await market_data_service.get_stock_history(
            symbol, period, interval
        )

        # Cache the data
        await cache_manager.set(cache_key, history_data, expire=300)

        return history_data

    except Exception as e:
        logger.error(f"Error fetching history for {symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch stock history: {str(e)}"
        )


@router.get("/{symbol}/indicators")
async def get_technical_indicators(symbol: str) -> TechnicalIndicators:
    """Get technical indicators for a stock"""
    try:
        # Try to get from cache first
        cache_key = f"technical_indicators_{symbol.lower()}"
        cached_indicators = await cache_manager.get(cache_key)

        if cached_indicators:
            return TechnicalIndicators(**cached_indicators)

        # Calculate indicators
        indicators = await technical_analysis_service.calculate_indicators(symbol)

        # Cache the indicators
        await cache_manager.set(cache_key, indicators.model_dump(), expire=300)

        return indicators

    except Exception as e:
        logger.error(f"Error calculating indicators for {symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to calculate indicators: {str(e)}"
        )


@router.get("/search")
async def search_stocks(
    query: str = Query(..., description="Search query for stocks"),
) -> List[Dict[str, Any]]:
    """Search for stocks by name or symbol"""
    try:
        # Try to get from cache first
        cache_key = f"stock_search_{query.lower()}"
        cached_results = await cache_manager.get(cache_key)

        if cached_results:
            return cached_results

        # Search using yfinance with multiple symbol variations
        search_results = []

        # Try different symbol variations
        search_variations = [
            query.upper(),  # Original query
            f"{query.upper()}.NS",  # NSE (Indian stocks)
            f"{query.upper()}.BO",  # BSE (Indian stocks)
        ]

        for symbol_variation in search_variations:
            try:
                ticker = yf.Ticker(symbol_variation)
                info = ticker.info

                if info and "symbol" in info and info.get("currentPrice"):
                    search_results.append(
                        {
                            "symbol": info.get("symbol", symbol_variation),
                            "name": info.get("longName", info.get("shortName", query)),
                            "exchange": info.get("exchange", ""),
                            "type": info.get("quoteType", ""),
                            "market_cap": info.get("marketCap"),
                            "current_price": info.get("currentPrice"),
                        }
                    )
                    break  # Found a valid result, stop searching
            except Exception as e:
                logger.warning(f"yfinance search failed for {symbol_variation}: {e}")
                continue

        # Cache the results
        await cache_manager.set(cache_key, search_results, expire=300)

        return search_results

    except Exception as e:
        logger.error(f"Error searching stocks: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to search stocks: {str(e)}"
        )


@router.get("/market/overview")
async def get_market_overview() -> Dict[str, Any]:
    """Get market overview with major indices"""
    try:
        # Try to get from cache first
        cache_key = "market_overview"
        cached_overview = await cache_manager.get(cache_key)

        if cached_overview:
            return cached_overview

        # Major indices to track
        indices = ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX"]
        market_data = {}

        for index in indices:
            try:
                ticker = yf.Ticker(index)
                info = ticker.info

                market_data[index] = {
                    "name": info.get("longName", index),
                    "current_price": info.get("currentPrice", 0),
                    "change": info.get("regularMarketChange", 0),
                    "change_percent": info.get("regularMarketChangePercent", 0),
                    "volume": info.get("volume", 0),
                }
            except Exception as e:
                logger.warning(f"Failed to fetch {index}: {e}")
                market_data[index] = {
                    "name": index,
                    "current_price": 0,
                    "change": 0,
                    "change_percent": 0,
                    "volume": 0,
                }

        overview = {
            "timestamp": datetime.now().isoformat(),
            "indices": market_data,
            "market_status": "open" if datetime.now().hour < 16 else "closed",
        }

        # Cache the overview
        await cache_manager.set(cache_key, overview, expire=60)

        return overview

    except Exception as e:
        logger.error(f"Error fetching market overview: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch market overview: {str(e)}"
        )
