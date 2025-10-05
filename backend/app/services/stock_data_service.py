import yfinance as yf
import requests
import logging
from typing import Dict, Optional
from datetime import datetime
from app.services.news_service import NewsService

logger = logging.getLogger(__name__)


class StockDataService:
    def __init__(
        self,
        alpha_vantage_key: Optional[str] = None,
        news_api_key: Optional[str] = None,
    ):
        self.alpha_vantage_key = alpha_vantage_key
        self.base_url = "https://www.alphavantage.co/query"
        self.news_service = NewsService(news_api_key)

    def get_stock_data(self, symbol: str) -> Dict:
        """
        Get comprehensive stock data from multiple sources
        """
        try:
            # Try yfinance first (more reliable for most stocks)
            yf_data = self._get_yfinance_data(symbol)
            if yf_data:
                return yf_data

            # Fallback to Alpha Vantage if yfinance fails
            if self.alpha_vantage_key:
                av_data = self._get_alpha_vantage_data(symbol)
                if av_data:
                    return av_data

            # If both fail, return error
            return {
                "error": f"Unable to fetch data for {symbol}. Please check the symbol and try again.",
                "symbol": symbol.upper(),
            }

        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {e}")
            return {
                "error": f"Error fetching data for {symbol}: {str(e)}",
                "symbol": symbol.upper(),
            }

    def _get_yfinance_data(self, symbol: str) -> Optional[Dict]:
        """
        Get stock data using yfinance
        """
        try:
            # Handle different symbol formats
            ticker_symbol = self._normalize_symbol(symbol)
            ticker = yf.Ticker(ticker_symbol)

            # Get current info
            info = ticker.info

            # Get historical data for technical analysis
            hist = ticker.history(period="1mo")

            if hist.empty or not info:
                return None

            # Get current price and change
            current_price = hist["Close"].iloc[-1]
            prev_close = hist["Close"].iloc[-2] if len(hist) > 1 else current_price
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close != 0 else 0

            # Calculate technical indicators
            rsi = self._calculate_rsi(hist["Close"])
            macd_signal = self._calculate_macd_signal(hist["Close"])
            moving_avg_trend = self._get_moving_average_trend(hist["Close"])

            # Get news using the news service
            news = self.news_service.get_stock_news(symbol, 3)

            # Determine sentiment
            sentiment_score = self._calculate_sentiment(
                change_percent, rsi, macd_signal
            )
            sentiment = (
                "Bullish"
                if sentiment_score > 0.6
                else "Bearish"
                if sentiment_score < 0.4
                else "Neutral"
            )

            # Calculate price targets
            resistance = current_price * 1.1  # 10% above current
            support = current_price * 0.9  # 10% below current

            return {
                "symbol": symbol.upper(),
                "name": info.get("longName", info.get("shortName", symbol.upper())),
                "current_price": round(current_price, 2),
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "currency": info.get("currency", "USD"),
                "market_cap": info.get("marketCap"),
                "volume": hist["Volume"].iloc[-1],
                "rsi": round(rsi, 1),
                "macd_signal": macd_signal,
                "moving_avg_trend": moving_avg_trend,
                "resistance": round(resistance, 2),
                "support": round(support, 2),
                "news": news,
                "sentiment": sentiment,
                "sentiment_score": round(sentiment_score, 2),
                "pe_ratio": info.get("trailingPE"),
                "dividend_yield": info.get("dividendYield"),
                "data_source": "yfinance",
                "last_updated": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"yfinance error for {symbol}: {e}")
            return None

    def _get_alpha_vantage_data(self, symbol: str) -> Optional[Dict]:
        """
        Get stock data using Alpha Vantage API
        """
        try:
            if not self.alpha_vantage_key:
                return None

            # Get quote data
            quote_params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self.alpha_vantage_key,
            }

            response = requests.get(self.base_url, params=quote_params, timeout=10)
            data = response.json()

            if "Error Message" in data:
                logger.error(f"Alpha Vantage error: {data['Error Message']}")
                return None

            if "Note" in data:
                logger.warning(f"Alpha Vantage rate limit: {data['Note']}")
                return None

            quote = data.get("Global Quote", {})
            if not quote:
                return None

            # Parse quote data
            current_price = float(quote.get("05. price", 0))
            change = float(quote.get("09. change", 0))
            change_percent = float(quote.get("10. change percent", 0).replace("%", ""))
            volume = int(quote.get("06. volume", 0))

            # Get company overview
            overview_params = {
                "function": "OVERVIEW",
                "symbol": symbol,
                "apikey": self.alpha_vantage_key,
            }

            overview_response = requests.get(
                self.base_url, params=overview_params, timeout=10
            )
            overview_data = overview_response.json()

            # Calculate basic technical indicators (simplified)
            rsi = 50.0  # Default neutral
            macd_signal = "Neutral"
            moving_avg_trend = "Neutral"

            # Determine sentiment
            sentiment_score = (
                0.5 + (change_percent / 100) * 0.3
            )  # Simple sentiment based on change
            sentiment_score = max(
                0.0, min(1.0, sentiment_score)
            )  # Clamp between 0 and 1
            sentiment = (
                "Bullish"
                if sentiment_score > 0.6
                else "Bearish"
                if sentiment_score < 0.4
                else "Neutral"
            )

            # Calculate price targets
            resistance = current_price * 1.1
            support = current_price * 0.9

            # Get news using the news service
            news = self.news_service.get_stock_news(symbol, 3)

            return {
                "symbol": symbol.upper(),
                "name": overview_data.get("Name", symbol.upper()),
                "current_price": round(current_price, 2),
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "currency": overview_data.get("Currency", "USD"),
                "market_cap": overview_data.get("MarketCapitalization"),
                "volume": volume,
                "rsi": rsi,
                "macd_signal": macd_signal,
                "moving_avg_trend": moving_avg_trend,
                "resistance": round(resistance, 2),
                "support": round(support, 2),
                "news": news,
                "sentiment": sentiment,
                "sentiment_score": round(sentiment_score, 2),
                "pe_ratio": overview_data.get("PERatio"),
                "dividend_yield": overview_data.get("DividendYield"),
                "data_source": "alpha_vantage",
                "last_updated": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Alpha Vantage error for {symbol}: {e}")
            return None

    def _normalize_symbol(self, symbol: str) -> str:
        """
        Normalize stock symbol for different exchanges
        """
        symbol = symbol.upper().strip()

        # Add exchange suffixes for Indian stocks
        indian_stocks = {
            "TCS": "TCS.NS",  # NSE
            "RELIANCE": "RELIANCE.NS",
            "INFY": "INFY.NS",
            "WIPRO": "WIPRO.NS",
            "HDFC": "HDFCBANK.NS",
            "ICICI": "ICICIBANK.NS",
            "SBI": "SBIN.NS",
            "BAJFINANCE": "BAJFINANCE.NS",
            "TATAMOTORS": "TATAMOTORS.NS",
            "MAHINDRA": "M&M.NS",
            "ITC": "ITC.NS",
            "HINDALCO": "HINDALCO.NS",
            "COALINDIA": "COALINDIA.NS",
            "BHARTI": "BHARTIARTL.NS",
            "ASIANPAINTS": "ASIANPAINT.NS",
            "MARUTI": "MARUTI.NS",
            "HERO": "HEROMOTOCO.NS",
            "BAJAJAUTO": "BAJAJ-AUTO.NS",
            "ULTRACEMCO": "ULTRACEMCO.NS",
            "NESTLE": "NESTLEIND.NS",
            "HUL": "HINDUNILVR.NS",
            "CIPLA": "CIPLA.NS",
            "SUNPHARMA": "SUNPHARMA.NS",
            "DRREDDY": "DRREDDY.NS",
            "DIVISLAB": "DIVISLAB.NS",
            "CADILAHC": "CADILAHC.NS",
            "LUPIN": "LUPIN.NS",
            "AXISBANK": "AXISBANK.NS",
            "KOTAKBANK": "KOTAKBANK.NS",
            "YESBANK": "YESBANK.NS",
            "PNB": "PNB.NS",
            "UNIONBANK": "UNIONBANK.NS",
            "CANARABANK": "CANBK.NS",
            "BANKBARODA": "BANKBARODA.NS",
        }

        return indian_stocks.get(symbol, symbol)

    def _calculate_rsi(self, prices, period=14):
        """
        Calculate RSI (Relative Strength Index)
        """
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi.iloc[-1] if not rsi.empty else 50.0
        except Exception:
            return 50.0

    def _calculate_macd_signal(self, prices):
        """
        Calculate MACD signal
        """
        try:
            ema_12 = prices.ewm(span=12).mean()
            ema_26 = prices.ewm(span=26).mean()
            macd = ema_12 - ema_26
            signal_line = macd.ewm(span=9).mean()

            if macd.iloc[-1] > signal_line.iloc[-1]:
                return "Bullish"
            else:
                return "Bearish"
        except Exception:
            return "Neutral"

    def _get_moving_average_trend(self, prices):
        """
        Get moving average trend
        """
        try:
            ma_50 = prices.rolling(window=50).mean()
            current_price = prices.iloc[-1]
            ma_value = ma_50.iloc[-1]

            if current_price > ma_value:
                return "Above"
            else:
                return "Below"
        except Exception:
            return "Neutral"

    def _calculate_sentiment(self, change_percent, rsi, macd_signal):
        """
        Calculate overall sentiment score
        """
        # Base sentiment from price change
        price_sentiment = 0.5 + (change_percent / 100) * 0.3

        # RSI adjustment
        if rsi < 30:  # Oversold
            price_sentiment += 0.1
        elif rsi > 70:  # Overbought
            price_sentiment -= 0.1

        # MACD adjustment
        if macd_signal == "Bullish":
            price_sentiment += 0.1
        elif macd_signal == "Bearish":
            price_sentiment -= 0.1

        # Clamp between 0 and 1
        return max(0.0, min(1.0, price_sentiment))
