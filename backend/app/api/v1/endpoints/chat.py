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
    "yes": "Great! Let me run a comprehensive analysis for you. I'll gather the latest data and provide detailed insights.",
    "sure": "Perfect! I'll analyze the stock comprehensively and give you actionable insights.",
    "ok": "Excellent! Let me pull up the detailed analysis with current market data.",
    "go ahead": "I'll start the analysis now. This will include technical indicators, price trends, and market sentiment.",
}


def get_chat_response(message: str, mode: str = "analysis") -> str:
    """Generate a response based on the user's message"""
    message_lower = message.lower().strip()

    # Check for specific keywords
    for keyword, response in CHAT_RESPONSES.items():
        if keyword in message_lower:
            return response

    # Check for confirmation patterns
    confirmation_words = ["yeah", "yes", "sure", "ok", "okay", "go ahead", "please", "do it", "run it", "analyze it"]
    if any(word in message_lower for word in confirmation_words):
        return "Perfect! I'll run a comprehensive analysis for you. This will include:\n- Current price and trends\n- Technical indicators (RSI, MACD, Moving Averages)\n- Price predictions and targets\n- Market sentiment analysis\n- Recent news and events\n- Risk assessment\n\nLet me gather the latest data..."

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

        # Generate response
        response_text = get_chat_response(user_content, mode)

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
