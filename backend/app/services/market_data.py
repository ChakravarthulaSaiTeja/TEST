import yfinance as yf
import pandas as pd
from typing import List, Dict, Any, Optional


class MarketDataService:
    """Service for fetching market data from various sources"""

    def __init__(self):
        pass

    async def get_stock_history(
        self, symbol: str, period: str = "2y"
    ) -> List[Dict[str, Any]]:
        """Get historical stock data"""
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period)

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
                    }
                )

            return history_data

        except Exception as e:
            print(f"Error fetching stock history: {e}")
            return []

    async def get_stock_info(self, symbol: str) -> Dict[str, Any]:
        """Get stock information"""
        try:
            stock = yf.Ticker(symbol)
            info = stock.info

            return {
                "symbol": symbol,
                "name": info.get("longName", symbol),
                "sector": info.get("sector", "Unknown"),
                "industry": info.get("industry", "Unknown"),
                "market_cap": info.get("marketCap", 0),
                "pe_ratio": info.get("trailingPE", 0),
                "dividend_yield": info.get("dividendYield", 0),
                "beta": info.get("beta", 0),
            }

        except Exception as e:
            print(f"Error fetching stock info: {e}")
            return {}
