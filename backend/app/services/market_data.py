import yfinance as yf
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import asyncio
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)


class MarketDataService:
    """Service for fetching market data from various sources"""

    def __init__(self):
        self.cache_ttl = 60  # 1 minute cache for real-time data

    async def get_stock_history(
        self, symbol: str, period: str = "2y", interval: str = "1d"
    ) -> List[Dict[str, Any]]:
        """Get historical stock data"""
        try:
            cache_key = f"stock_history_{symbol}_{period}_{interval}"
            cached_data = await cache_manager.get(cache_key)

            if cached_data:
                return cached_data

            stock = yf.Ticker(symbol)
            hist = stock.history(period=period, interval=interval)

            if hist.empty:
                return []

            # Convert to list of dicts
            history_data = []
            for date, row in hist.iterrows():
                history_data.append(
                    {
                        "date": date.isoformat(),
                        "open": float(row["Open"]),
                        "high": float(row["High"]),
                        "low": float(row["Low"]),
                        "close": float(row["Close"]),
                        "volume": int(row["Volume"]),
                        "adj_close": float(row.get("Adj Close", row["Close"])),
                    }
                )

            # Cache the data
            await cache_manager.set(
                cache_key, history_data, expire=300
            )  # 5 minutes for historical data
            return history_data

        except Exception as e:
            logger.error(f"Error fetching stock history for {symbol}: {e}")
            return []

    async def get_stock_info(self, symbol: str) -> Dict[str, Any]:
        """Get comprehensive stock information"""
        try:
            cache_key = f"stock_info_{symbol}"
            cached_data = await cache_manager.get(cache_key)

            if cached_data:
                return cached_data

            stock = yf.Ticker(symbol)
            info = stock.info

            # Get current price data
            current_data = stock.history(period="1d")
            current_price = 0
            change = 0
            change_percent = 0
            volume = 0

            if not current_data.empty:
                current_price = float(current_data["Close"].iloc[-1])
                if len(current_data) > 1:
                    prev_close = float(current_data["Close"].iloc[-2])
                    change = current_price - prev_close
                    change_percent = (change / prev_close) * 100
                volume = int(current_data["Volume"].iloc[-1])

            stock_data = {
                "symbol": symbol,
                "name": info.get("longName", symbol),
                "sector": info.get("sector", "Unknown"),
                "industry": info.get("industry", "Unknown"),
                "market_cap": info.get("marketCap", 0),
                "pe_ratio": info.get("trailingPE", 0),
                "dividend_yield": info.get("dividendYield", 0),
                "beta": info.get("beta", 0),
                "current_price": current_price,
                "change": change,
                "change_percent": change_percent,
                "volume": volume,
                "open": info.get("regularMarketOpen", 0),
                "high": info.get("dayHigh", 0),
                "low": info.get("dayLow", 0),
                "previous_close": info.get("regularMarketPreviousClose", 0),
                "fifty_two_week_high": info.get("fiftyTwoWeekHigh", 0),
                "fifty_two_week_low": info.get("fiftyTwoWeekLow", 0),
                "avg_volume": info.get("averageVolume", 0),
                "price_to_book": info.get("priceToBook", 0),
                "price_to_sales": info.get("priceToSalesTrailing12Months", 0),
                "debt_to_equity": info.get("debtToEquity", 0),
                "return_on_equity": info.get("returnOnEquity", 0),
                "return_on_assets": info.get("returnOnAssets", 0),
                "profit_margins": info.get("profitMargins", 0),
                "last_updated": datetime.now().isoformat(),
            }

            # Cache the data
            await cache_manager.set(cache_key, stock_data, expire=self.cache_ttl)
            return stock_data

        except Exception as e:
            logger.error(f"Error fetching stock info for {symbol}: {e}")
            return {}

    async def get_stock_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time stock quote"""
        try:
            cache_key = f"stock_quote_{symbol}"
            cached_data = await cache_manager.get(cache_key)

            if cached_data:
                return cached_data

            stock = yf.Ticker(symbol)
            current_data = stock.history(period="1d")

            if current_data.empty:
                return {}

            latest = current_data.iloc[-1]
            quote = {
                "symbol": symbol,
                "current_price": float(latest["Close"]),
                "open": float(latest["Open"]),
                "high": float(latest["High"]),
                "low": float(latest["Low"]),
                "volume": int(latest["Volume"]),
                "timestamp": datetime.now().isoformat(),
            }

            # Cache for very short time (real-time data)
            await cache_manager.set(cache_key, quote, expire=30)  # 30 seconds
            return quote

        except Exception as e:
            logger.error(f"Error fetching stock quote for {symbol}: {e}")
            return {}

    async def search_stocks(self, query: str) -> List[Dict[str, Any]]:
        """Search for stocks by name or symbol"""
        try:
            cache_key = f"stock_search_{query}"
            cached_data = await cache_manager.get(cache_key)

            if cached_data:
                return cached_data

            # Use yfinance search functionality
            search_results = yf.Tickers(query)

            results = []
            for ticker in search_results.tickers[:10]:  # Limit to 10 results
                try:
                    info = ticker.info
                    results.append(
                        {
                            "symbol": ticker.ticker,
                            "name": info.get("longName", ticker.ticker),
                            "sector": info.get("sector", "Unknown"),
                            "market_cap": info.get("marketCap", 0),
                        }
                    )
                except:
                    continue

            # Cache search results
            await cache_manager.set(cache_key, results, expire=600)  # 10 minutes
            return results

        except Exception as e:
            logger.error(f"Error searching stocks for '{query}': {e}")
            return []

    async def get_market_summary(self) -> Dict[str, Any]:
        """Get market summary for major indices"""
        try:
            cache_key = "market_summary"
            cached_data = await cache_manager.get(cache_key)

            if cached_data:
                return cached_data

            indices = [
                "^GSPC",
                "^DJI",
                "^IXIC",
                "^RUT",
            ]  # S&P 500, Dow, NASDAQ, Russell 2000
            summary = {}

            for index in indices:
                try:
                    ticker = yf.Ticker(index)
                    hist = ticker.history(period="1d")

                    if not hist.empty:
                        current = float(hist["Close"].iloc[-1])
                        prev_close = float(hist["Open"].iloc[0])
                        change = current - prev_close
                        change_percent = (change / prev_close) * 100

                        summary[index] = {
                            "current": current,
                            "change": change,
                            "change_percent": change_percent,
                            "volume": int(hist["Volume"].iloc[-1]),
                        }
                except Exception as e:
                    logger.warning(f"Error fetching data for {index}: {e}")
                    continue

            # Cache market summary
            await cache_manager.set(cache_key, summary, expire=300)  # 5 minutes
            return summary

        except Exception as e:
            logger.error(f"Error fetching market summary: {e}")
            return {}

    async def get_crypto_data(self, symbol: str = "BTC-USD") -> Dict[str, Any]:
        """Get cryptocurrency data"""
        try:
            cache_key = f"crypto_{symbol}"
            cached_data = await cache_manager.get(cache_key)

            if cached_data:
                return cached_data

            crypto = yf.Ticker(symbol)
            hist = crypto.history(period="1d")

            if hist.empty:
                return {}

            latest = hist.iloc[-1]
            crypto_data = {
                "symbol": symbol,
                "current_price": float(latest["Close"]),
                "open": float(latest["Open"]),
                "high": float(latest["High"]),
                "low": float(latest["Low"]),
                "volume": float(latest["Volume"]),
                "market_cap": crypto.info.get("marketCap", 0),
                "timestamp": datetime.now().isoformat(),
            }

            # Cache crypto data
            await cache_manager.set(cache_key, crypto_data, expire=60)  # 1 minute
            return crypto_data

        except Exception as e:
            logger.error(f"Error fetching crypto data for {symbol}: {e}")
            return {}

    async def get_earnings_calendar(self, symbol: str) -> List[Dict[str, Any]]:
        """Get earnings calendar for a stock"""
        try:
            cache_key = f"earnings_{symbol}"
            cached_data = await cache_manager.get(cache_key)

            if cached_data:
                return cached_data

            stock = yf.Ticker(symbol)
            calendar = stock.calendar

            if calendar is None or calendar.empty:
                return []

            earnings_data = []
            for _, row in calendar.iterrows():
                earnings_data.append(
                    {
                        "date": row.get("Earnings Date", ""),
                        "estimate": row.get("EPS Estimate", 0),
                        "actual": row.get("EPS Actual", 0),
                        "surprise": row.get("EPS Surprise", 0),
                        "surprise_percent": row.get("Surprise %", 0),
                    }
                )

            # Cache earnings data
            await cache_manager.set(cache_key, earnings_data, expire=3600)  # 1 hour
            return earnings_data

        except Exception as e:
            logger.error(f"Error fetching earnings calendar for {symbol}: {e}")
            return []
