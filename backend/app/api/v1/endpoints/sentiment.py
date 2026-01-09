from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging
from datetime import datetime

from app.core.cache import cache_manager
from app.services.market_data import MarketDataService
from app.services.technical_analysis import TechnicalAnalysisService

logger = logging.getLogger(__name__)
router = APIRouter()

market_data_service = MarketDataService()
technical_service = TechnicalAnalysisService()


@router.get("/{symbol}")
async def get_sentiment_analysis(symbol: str) -> Dict[str, Any]:
    """
    Get sentiment analysis for a stock symbol (currently only supports NIFTY 50)
    """
    try:
        # Normalize symbol
        symbol_upper = symbol.upper()
        if symbol_upper not in ["^NSEI", "NSEI"]:
            raise HTTPException(
                status_code=400,
                detail="Currently only NIFTY 50 (^NSEI) is supported for sentiment analysis"
            )
        
        # Use ^NSEI for backend calls
        nifty_symbol = "^NSEI"
        
        # Check cache
        cache_key = f"sentiment_{nifty_symbol.lower()}"
        cached_sentiment = await cache_manager.get(cache_key)
        if cached_sentiment:
            return cached_sentiment
        
        # Fetch stock data
        stock_info = await market_data_service.get_stock_info(nifty_symbol)
        if not stock_info:
            raise HTTPException(
                status_code=404,
                detail=f"Could not fetch data for {nifty_symbol}"
            )
        
        # Fetch historical data for technical analysis
        history = await market_data_service.get_stock_history(
            nifty_symbol, period="6mo", interval="1d"
        )
        
        if not history or len(history) < 50:
            raise HTTPException(
                status_code=404,
                detail="Insufficient historical data for sentiment analysis"
            )
        
        # Convert to DataFrame for technical analysis
        import pandas as pd
        df = pd.DataFrame(history)
        df.columns = [col.lower() for col in df.columns]
        
        # Calculate technical indicators
        indicators = technical_service.calculate_indicators(df)
        
        # Calculate sentiment score
        change_percent = stock_info.get("change_percent", 0)
        rsi = indicators.get("rsi", 50) if indicators.get("rsi") is not None else 50
        macd = indicators.get("macd", 0)
        macd_signal_line = indicators.get("macd_signal", 0)
        macd_signal = "Bullish" if macd > macd_signal_line else "Bearish"
        
        # Calculate sentiment using the service method
        sentiment_score = technical_service._calculate_sentiment(
            change_percent, rsi, macd_signal
        )
        
        # Determine sentiment label
        if sentiment_score > 0.6:
            sentiment_label = "Bullish"
        elif sentiment_score < 0.4:
            sentiment_label = "Bearish"
        else:
            sentiment_label = "Neutral"
        
        # Calculate confidence based on data quality and signal strength
        confidence = min(0.95, 0.7 + abs(sentiment_score - 0.5) * 0.5)
        
        # Determine trend
        current_price = stock_info.get("current_price", 0)
        sma_20 = indicators.get("sma_20", current_price)
        sma_50 = indicators.get("sma_50", current_price)
        
        if current_price > sma_20 > sma_50:
            trend = "Up"
        elif current_price < sma_20 < sma_50:
            trend = "Down"
        else:
            trend = "Sideways"
        
        result = {
            "symbol": nifty_symbol,
            "name": stock_info.get("name", "NIFTY 50"),
            "score": float(sentiment_score),
            "sentiment": sentiment_label,
            "confidence": float(confidence),
            "change": float(stock_info.get("change", 0)),
            "change_percent": float(change_percent),
            "price": float(current_price),
            "volume": float(stock_info.get("volume", 0)),
            "trend": trend,
            "technical_indicators": {
                "rsi": float(rsi) if rsi else None,
                "macd": float(indicators.get("macd", 0)),
                "sma_20": float(sma_20) if sma_20 else None,
                "sma_50": float(sma_50) if sma_50 else None,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Cache for 5 minutes
        await cache_manager.set(cache_key, result, expire=300)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating sentiment for {symbol}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate sentiment: {str(e)}"
        )
