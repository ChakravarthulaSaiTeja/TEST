from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import json
import logging
import asyncio
from datetime import datetime
from app.services.stock_data_service import StockDataService
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Simple chat responses for demo purposes
CHAT_RESPONSES = {
    "hello": "Hello! I'm your AI trading assistant. I can help you analyze stocks, get market insights, and answer trading questions. What would you like to know?",
    "help": "I can help you with:\n- Stock analysis and predictions\n- Market news and sentiment\n- Portfolio management\n- Trading strategies\n- Market data interpretation\n\nJust ask me anything about trading or the markets!",
    "stocks": "I can help you analyze stocks! Try asking me about specific stocks like:\n- 'Analyze AAPL'\n- 'What's the prediction for TSLA?'\n- 'Show me NVDA performance'\n\nI can provide technical analysis, predictions, and market insights.",
    "market": "The current market shows mixed signals. Here's what I can tell you:\n- Tech stocks are showing volatility\n- Energy sector is trending upward\n- Overall market sentiment is cautious\n\nWould you like me to analyze any specific sector or stock?",
    "portfolio": "I can help you with portfolio management! I can:\n- Analyze your current holdings\n- Suggest diversification strategies\n- Provide risk assessment\n- Recommend rebalancing\n\nWhat would you like to know about your portfolio?",
    "prediction": "I use advanced machine learning models to predict stock movements. My predictions include:\n- Short-term price targets\n- Technical analysis indicators\n- Market sentiment factors\n- Risk assessments\n\nWhich stock would you like me to analyze?",
    "news": "I can help you stay updated with the latest market news! I track:\n- Earnings reports\n- Economic indicators\n- Company announcements\n- Market-moving events\n\nWould you like me to summarize recent news for any specific stock or sector?",
    "trading": "I can assist with trading strategies! I can help you with:\n- Entry and exit points\n- Risk management\n- Position sizing\n- Technical indicators\n- Market timing\n\nWhat type of trading strategy are you interested in?",
}


def get_detailed_stock_analysis(stock_symbol: str = "TCS") -> str:
    """Generate detailed stock analysis with real-time data"""
    try:
        # Initialize stock data service
        stock_service = StockDataService(
            settings.ALPHA_VANTAGE_API_KEY, settings.NEWS_API_KEY
        )

        # Get real stock data
        stock_data = stock_service.get_stock_data(stock_symbol)

        # Check if we got an error
        if "error" in stock_data:
            return f"❌ {stock_data['error']}"

        # Format the analysis with real data
        currency_symbol = stock_data.get("currency", "₹")
        if currency_symbol == "USD":
            currency_symbol = "$"
        elif currency_symbol == "INR":
            currency_symbol = "₹"

        # Determine trend emoji and color indicators
        trend_emoji = "📈" if stock_data["change"] >= 0 else "📉"
        sentiment_emoji = (
            "🟢"
            if stock_data["sentiment_score"] > 0.6
            else "🔴"
            if stock_data["sentiment_score"] < 0.4
            else "🟡"
        )
        rsi_emoji = (
            "🔴" if stock_data["rsi"] > 70 else "🟢" if stock_data["rsi"] < 30 else "🟡"
        )
        macd_emoji = (
            "🟢"
            if stock_data["macd_signal"] == "Bullish"
            else "🔴"
            if stock_data["macd_signal"] == "Bearish"
            else "🟡"
        )

        analysis = f"""📊 {stock_data["symbol"]} STOCK ANALYSIS 📊

💰 CURRENT PRICE: {currency_symbol}{stock_data["current_price"]:,} {trend_emoji}
📈 CHANGE: {currency_symbol}{stock_data["change"]:+,} ({stock_data["change_percent"]:+.2f}%)

🔍 TECHNICAL INDICATORS:
• RSI: {stock_data["rsi"]} {rsi_emoji} ({"Oversold" if stock_data["rsi"] < 30 else "Overbought" if stock_data["rsi"] > 70 else "Neutral"})
• MACD: {stock_data["macd_signal"]} {macd_emoji}
• Moving Average: {stock_data["moving_avg_trend"]} {"📈" if stock_data["moving_avg_trend"] == "Above" else "📉"}

🎯 PRICE TARGETS:
• Resistance: {currency_symbol}{stock_data["resistance"]:,} 📈
• Support: {currency_symbol}{stock_data["support"]:,} 📉

📰 RECENT NEWS:
• {stock_data["news"][0] if stock_data["news"] else "No recent news available"}
• {stock_data["news"][1] if len(stock_data["news"]) > 1 else "Market analysis pending"}
• {stock_data["news"][2] if len(stock_data["news"]) > 2 else "Company updates expected"}

📊 MARKET SENTIMENT: {stock_data["sentiment"]} {sentiment_emoji} ({stock_data["sentiment_score"]:.1%})

💡 ANALYSIS: {"Strong bullish momentum" if stock_data["sentiment_score"] > 0.6 else "Bearish pressure" if stock_data["sentiment_score"] < 0.4 else "Mixed signals"}. Technical indicators suggest {"positive trend continuation" if stock_data["macd_signal"] == "Bullish" else "potential correction"}.

🎯 RECOMMENDATION: {"Consider buying on dips" if stock_data["sentiment_score"] > 0.6 else "Wait for better entry point" if stock_data["sentiment_score"] < 0.4 else "Monitor for breakout"}.

⚠️ RISK LEVEL: {"Low" if stock_data["sentiment_score"] > 0.6 else "Medium" if stock_data["sentiment_score"] > 0.4 else "High"} {"🟢" if stock_data["sentiment_score"] > 0.6 else "🟡" if stock_data["sentiment_score"] > 0.4 else "🔴"}"""

        return analysis

    except Exception as e:
        logger.error(f"Error in stock analysis for {stock_symbol}: {e}")
        return f"❌ Error analyzing {stock_symbol}: {str(e)}"


def get_chat_response(
    message: str, mode: str = "analysis", stock_symbol: str = "TCS"
) -> str:
    """Generate a response based on the user's message"""
    message_lower = message.lower().strip()

    # Check for specific keywords
    for keyword, response in CHAT_RESPONSES.items():
        if keyword in message_lower:
            return response

    # Check for confirmation patterns
    confirmation_words = [
        "yeah",
        "yes",
        "sure",
        "ok",
        "okay",
        "go ahead",
        "please",
        "do it",
        "run it",
        "analyze it",
    ]
    if any(word in message_lower for word in confirmation_words):
        return get_detailed_stock_analysis(stock_symbol)

    # Check for trading-related queries first (before stock symbols)
    if any(
        word in message_lower
        for word in ["buy", "sell", "trade", "position", "trading"]
    ):
        if mode == "trade":
            return "I can help you place trades! I can:\n- Analyze entry/exit points\n- Calculate position sizes\n- Assess risk levels\n- Execute trades (paper trading)\n\nWhat would you like to trade?"
        else:
            return "I can help you with trading analysis! I can:\n- Analyze potential trades\n- Provide technical indicators\n- Suggest entry/exit points\n- Calculate risk metrics\n\nWhat stock are you considering?"

    # Check for stock symbols (expanded list)
    stock_symbols = [
        # US Stocks
        "aapl",
        "apple",
        "nvda",
        "nvidia",
        "tsla",
        "tesla",
        "msft",
        "microsoft",
        "googl",
        "google",
        "amzn",
        "amazon",
        "meta",
        "facebook",
        "netflix",
        "nflx",
        "uber",
        "lyft",
        "spotify",
        "spot",
        "zoom",
        "zm",
        "shopify",
        "shop",
        "paypal",
        "pypl",
        "square",
        "sq",
        "twitter",
        "twtr",
        "snap",
        "snapchat",
        # Indian Stocks
        "tcs",
        "tata consultancy",
        "reliance",
        "ril",
        "infy",
        "infosys",
        "wipro",
        "hdfc",
        "hdfc bank",
        "icici",
        "icici bank",
        "sbi",
        "state bank",
        "bajaj",
        "bajaj finance",
        "tata",
        "tata motors",
        "mahindra",
        "m&m",
        "itc",
        "hindalco",
        "coal india",
        "bharti",
        "bharti airtel",
        "asian paints",
        "maruti",
        "maruti suzuki",
        "hero",
        "hero motocorp",
        "bajaj auto",
        "ultracem",
        "ultra cement",
        "nestle",
        "hul",
        "hindustan unilever",
        "cipla",
        "sun pharma",
        "dr reddy",
        "divi's",
        "cadila",
        "lupin",
        "axis bank",
        "kotak",
        "kotak bank",
        "yes bank",
        "pnb",
        "punjab national bank",
        "union bank",
        "canara bank",
        "bank of baroda",
        "bob",
        # Crypto
        "bitcoin",
        "btc",
        "ethereum",
        "eth",
        "binance",
        "bnb",
        "cardano",
        "ada",
        "solana",
        "sol",
        "polkadot",
        "dot",
        "chainlink",
        "link",
        "litecoin",
        "ltc",
    ]

    # Check for stock symbols (direct symbol recognition)
    detected_symbol = None
    for symbol in stock_symbols:
        if symbol in message_lower:
            detected_symbol = symbol
            break

    if detected_symbol:
        # Map common names to ticker symbols
        symbol_mapping = {
            "apple": "AAPL",
            "nvidia": "NVDA",
            "tesla": "TSLA",
            "microsoft": "MSFT",
            "google": "GOOGL",
            "amazon": "AMZN",
            "facebook": "META",
            "netflix": "NFLX",
            "tata consultancy": "TCS",
            "infosys": "INFY",
            "hdfc bank": "HDFC",
            "icici bank": "ICICIBANK",
            "state bank": "SBIN",
            "bajaj finance": "BAJFINANCE",
            "tata motors": "TATAMOTORS",
            "bharti airtel": "BHARTIARTL",
            "maruti suzuki": "MARUTI",
            "hero motocorp": "HEROMOTOCO",
            "ultra cement": "ULTRACEMCO",
            "hindustan unilever": "HINDUNILVR",
            "sun pharma": "SUNPHARMA",
            "dr reddy": "DRREDDY",
            "divi's": "DIVISLAB",
            "kotak bank": "KOTAKBANK",
            "punjab national bank": "PNB",
            "bank of baroda": "BANKBARODA",
            "bitcoin": "BTC",
            "ethereum": "ETH",
            "binance": "BNB",
            "cardano": "ADA",
            "solana": "SOL",
            "polkadot": "DOT",
            "chainlink": "LINK",
            "litecoin": "LTC",
        }
        stock_symbol = symbol_mapping.get(detected_symbol, detected_symbol.upper())

        return f"I can help you analyze {stock_symbol}! I can provide:\n- Current price and trends\n- Technical analysis\n- Price predictions\n- Market sentiment\n- Recent news\n\nWould you like me to run a detailed analysis?"

    # Default response
    return f"I understand you're asking about: '{message}'\n\nI'm here to help with trading and market analysis. I can assist with:\n- Stock analysis and predictions\n- Market news and insights\n- Portfolio management\n- Trading strategies\n\nCould you be more specific about what you'd like to know?"


@router.post("/")
async def chat_endpoint(request: Dict[str, Any]):
    """Handle chat messages and return streaming response"""
    try:
        messages = request.get("messages", [])
        mode = request.get("mode", "analysis")

        if not messages:
            raise HTTPException(status_code=400, detail="No messages provided")

        # Get the last user message
        last_message = messages[-1]
        if last_message.get("role") != "user":
            raise HTTPException(
                status_code=400, detail="Last message must be from user"
            )

        user_content = last_message.get("content", "")

        # Detect stock symbol from conversation context
        stock_symbol = "TCS"  # Default
        for message in messages:
            content = message.get("content", "").lower()
            # Check for stock symbols in the conversation
            stock_symbols = [
                # US Stocks
                "aapl",
                "apple",
                "nvda",
                "nvidia",
                "tsla",
                "tesla",
                "msft",
                "microsoft",
                "googl",
                "google",
                "amzn",
                "amazon",
                "meta",
                "facebook",
                "netflix",
                "nflx",
                "uber",
                "lyft",
                "spotify",
                "spot",
                "zoom",
                "zm",
                "shopify",
                "shop",
                "paypal",
                "pypl",
                "square",
                "sq",
                "twitter",
                "twtr",
                "snap",
                "snapchat",
                # Indian Stocks
                "tcs",
                "tata consultancy",
                "reliance",
                "ril",
                "infy",
                "infosys",
                "wipro",
                "hdfc",
                "hdfc bank",
                "icici",
                "icici bank",
                "sbi",
                "state bank",
                "bajaj",
                "bajaj finance",
                "tata",
                "tata motors",
                "mahindra",
                "m&m",
                "itc",
                "hindalco",
                "coal india",
                "bharti",
                "bharti airtel",
                "asian paints",
                "maruti",
                "maruti suzuki",
                "hero",
                "hero motocorp",
                "bajaj auto",
                "ultracem",
                "ultra cement",
                "nestle",
                "hul",
                "hindustan unilever",
                "cipla",
                "sun pharma",
                "dr reddy",
                "divi's",
                "cadila",
                "lupin",
                "axis bank",
                "kotak",
                "kotak bank",
                "yes bank",
                "pnb",
                "punjab national bank",
                "union bank",
                "canara bank",
                "bank of baroda",
                "bob",
                # Crypto
                "bitcoin",
                "btc",
                "ethereum",
                "eth",
                "binance",
                "bnb",
                "cardano",
                "ada",
                "solana",
                "sol",
                "polkadot",
                "dot",
                "chainlink",
                "link",
                "litecoin",
                "ltc",
            ]
            for symbol in stock_symbols:
                if symbol in content:
                    # Map common names to ticker symbols
                    symbol_mapping = {
                        "apple": "AAPL",
                        "nvidia": "NVDA",
                        "tesla": "TSLA",
                        "microsoft": "MSFT",
                        "google": "GOOGL",
                        "amazon": "AMZN",
                        "facebook": "META",
                        "netflix": "NFLX",
                        "tata consultancy": "TCS",
                        "infosys": "INFY",
                        "hdfc bank": "HDFC",
                        "icici bank": "ICICIBANK",
                        "state bank": "SBIN",
                        "bajaj finance": "BAJFINANCE",
                        "tata motors": "TATAMOTORS",
                        "bharti airtel": "BHARTIARTL",
                        "maruti suzuki": "MARUTI",
                        "hero motocorp": "HEROMOTOCO",
                        "ultra cement": "ULTRACEMCO",
                        "hindustan unilever": "HINDUNILVR",
                        "sun pharma": "SUNPHARMA",
                        "dr reddy": "DRREDDY",
                        "divi's": "DIVISLAB",
                        "kotak bank": "KOTAKBANK",
                        "punjab national bank": "PNB",
                        "bank of baroda": "BANKBARODA",
                        "bitcoin": "BTC",
                        "ethereum": "ETH",
                        "binance": "BNB",
                        "cardano": "ADA",
                        "solana": "SOL",
                        "polkadot": "DOT",
                        "chainlink": "LINK",
                        "litecoin": "LTC",
                    }
                    stock_symbol = symbol_mapping.get(symbol, symbol.upper())
                    break

        # Generate response
        response_text = get_chat_response(user_content, mode, stock_symbol)

        # Create streaming response
        async def generate_response():
            # Send response in larger chunks for better readability
            lines = response_text.split("\n")
            for line in lines:
                if line.strip():  # Skip empty lines
                    chunk = {
                        "type": "content",
                        "content": line + "\n",
                        "timestamp": datetime.now().isoformat(),
                    }
                    yield f"data: {json.dumps(chunk)}\n\n"
                    await asyncio.sleep(0.1)  # Slightly longer delay for readability

            # Send completion signal
            completion_chunk = {"type": "done", "timestamp": datetime.now().isoformat()}
            yield f"data: {json.dumps(completion_chunk)}\n\n"

        return StreamingResponse(
            generate_response(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        )

    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/")
async def chat_root():
    """Chat endpoint information"""
    return {
        "message": "AI Chat Assistant",
        "description": "AI-powered trading assistant for market analysis and trading support",
        "capabilities": [
            "Stock analysis and predictions",
            "Market news and sentiment",
            "Portfolio management",
            "Trading strategies",
            "Technical analysis",
        ],
    }
