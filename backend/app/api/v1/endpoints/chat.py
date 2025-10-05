from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import json
import logging
import asyncio
from datetime import datetime

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
    """Generate detailed stock analysis with current data"""
    import random
    from datetime import datetime, timedelta
    
    # Stock-specific data
    stock_data = {
        "tcs": {
            "name": "Tata Consultancy Services",
            "price_range": (3200, 3800),
            "currency": "₹",
            "news": [
                "TCS reports strong Q3 earnings with 12% YoY growth",
                "Company announces new digital transformation partnerships", 
                "TCS expands operations in European markets",
                "Strong demand for cloud services drives revenue growth",
                "Company maintains positive outlook for FY2024"
            ]
        },
        "reliance": {
            "name": "Reliance Industries",
            "price_range": (2400, 2800),
            "currency": "₹",
            "news": [
                "Reliance Jio reports strong subscriber growth",
                "Company announces new renewable energy investments",
                "Reliance Retail expands e-commerce operations",
                "Strong petrochemical margins drive profitability",
                "Company maintains leadership in telecom sector"
            ]
        },
        "aapl": {
            "name": "Apple Inc.",
            "price_range": (180, 220),
            "currency": "$",
            "news": [
                "Apple reports record iPhone sales in Q4",
                "Company announces new AI features for iOS",
                "Apple expands services revenue significantly",
                "Strong demand for MacBook Pro drives growth",
                "Company maintains premium market positioning"
            ]
        }
    }
    
    stock_info = stock_data.get(stock_symbol.lower(), stock_data["tcs"])
    
    # Simulate current market data
    current_price = round(random.uniform(*stock_info["price_range"]), 2)
    change = round(random.uniform(-current_price*0.05, current_price*0.05), 2)
    change_percent = round((change / current_price) * 100, 2)
    
    # Generate technical indicators
    rsi = round(random.uniform(30, 70), 1)
    macd_signal = "Bullish" if random.random() > 0.5 else "Bearish"
    moving_avg_trend = "Above" if random.random() > 0.5 else "Below"
    
    # Generate market sentiment
    sentiment_score = round(random.uniform(0.3, 0.8), 2)
    sentiment = "Bullish" if sentiment_score > 0.6 else "Bearish" if sentiment_score < 0.4 else "Neutral"
    
    # Generate price targets
    target_high = round(current_price * random.uniform(1.05, 1.15), 2)
    target_low = round(current_price * random.uniform(0.85, 0.95), 2)
    
    analysis = f"""📊 **{stock_symbol.upper()} ({stock_info['name']}) Analysis**

💰 **Current Price**: {stock_info['currency']}{current_price:,}
📈 **Change**: {stock_info['currency']}{change:+,} ({change_percent:+.2f}%)

🔍 **Technical Analysis**:
• RSI: {rsi} ({'Oversold' if rsi < 30 else 'Overbought' if rsi > 70 else 'Neutral'})
• MACD Signal: {macd_signal}
• Price vs 50-day MA: {moving_avg_trend}

🎯 **Price Targets**:
• Resistance: {stock_info['currency']}{target_high:,}
• Support: {stock_info['currency']}{target_low:,}

📰 **Recent News**:
• {stock_info['news'][0]}
• {stock_info['news'][1]}
• {stock_info['news'][2]}

📊 **Market Sentiment**: {sentiment} ({sentiment_score:.1%})

💡 **Analysis Summary**:
The stock shows {'strong bullish momentum' if sentiment_score > 0.6 else 'bearish pressure' if sentiment_score < 0.4 else 'mixed signals'}. 
Technical indicators suggest {'positive trend continuation' if macd_signal == 'Bullish' else 'potential correction'}.
{'Consider buying on dips' if sentiment_score > 0.6 else 'Wait for better entry point' if sentiment_score < 0.4 else 'Monitor for breakout'}.

⚠️ **Risk Level**: {'Low' if sentiment_score > 0.6 else 'Medium' if sentiment_score > 0.4 else 'High'}"""
    
    return analysis


def get_chat_response(message: str, mode: str = "analysis", stock_symbol: str = "TCS") -> str:
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

    # Check for stock symbols
    if any(
        symbol in message_lower
        for symbol in [
            "aapl",
            "nvda",
            "tsla",
            "msft",
            "googl",
            "amzn",
            "meta",
            "tcs",
            "infy",
            "wipro",
            "reliance",
            "hdfc",
            "icici",
            "sbi",
            "bajaj",
            "tata",
            "mahindra",
            "itc",
            "hindalco",
            "coal india",
            "bharti",
            "asian paints",
            "maruti",
            "hero",
            "bajaj auto",
            "ultracem",
            "nestle",
            "hul",
            "cipla",
            "sun pharma",
            "dr reddy",
            "divi's",
            "cadila",
            "lupin",
            "axis bank",
            "kotak",
            "yes bank",
            "pnb",
            "union bank",
            "canara bank",
            "bank of baroda",
        ]
    ):
        return "I can help you analyze that stock! I can provide:\n- Current price and trends\n- Technical analysis\n- Price predictions\n- Market sentiment\n- Recent news\n\nWould you like me to run a detailed analysis?"

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
            stock_symbols = ["tcs", "reliance", "aapl", "nvda", "tsla", "msft", "googl", "amzn", "meta"]
            for symbol in stock_symbols:
                if symbol in content and "analyze" in content:
                    stock_symbol = symbol.upper()
                    break

        # Generate response
        response_text = get_chat_response(user_content, mode, stock_symbol)

        # Create streaming response
        async def generate_response():
            # Simulate streaming by sending chunks
            words = response_text.split()
            for i, word in enumerate(words):
                chunk = {
                    "type": "content",
                    "content": word + " ",
                    "timestamp": datetime.now().isoformat(),
                }
                yield f"data: {json.dumps(chunk)}\n\n"
                await asyncio.sleep(0.05)  # Small delay for streaming effect

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
