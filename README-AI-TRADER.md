# AI Trading Chatbot - Forecaster AI

A sophisticated AI-powered trading assistant built with Next.js 15 (App Router) and FastAPI that provides stock analysis, news summaries, and executes trades through a custom MCP (Model Context Protocol) broker integration.

## 🚀 Features

- **AI-Powered Analysis**: Chat with GPT-4o-mini for stock analysis, technical indicators, and market insights
- **Real-time Market Data**: Live stock quotes, technical analysis (RSI, MACD, SMA, EMA), and news aggregation
- **Trade Execution**: Place buy/sell orders with explicit human confirmation and paper/live trading modes
- **Streaming UI**: Real-time chat interface with Server-Sent Events (SSE)
- **Safety First**: Multi-layer confirmation system with rate limiting and comprehensive logging
- **MCP Integration**: Custom broker adapter supporting both WebSocket and HTTP protocols
- **Portfolio Tracking**: Real-time positions and balance display on dashboard

## 🏗️ Architecture

### Frontend (Next.js 15)
- **App Router**: Modern Next.js routing with server components
- **Streaming Chat**: Real-time AI responses with SSE
- **Dark Theme**: Professional trading interface
- **TypeScript**: Full type safety throughout

### Backend Integration
- **Next.js API Routes**: Chat orchestration and market data APIs
- **FastAPI Backend**: Existing data services and database integration
- **MCP Client**: Model Context Protocol for broker communication

### AI & Tools
- **OpenRouter**: Core AI engine with function calling (supports multiple models including GPT-4o-mini)
- **Market Data APIs**: Alpha Vantage, NewsAPI, yfinance integration
- **Technical Analysis**: RSI, MACD, SMA, EMA calculations
- **News Sentiment**: Automated sentiment analysis of financial news

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+ (for FastAPI backend)
- OpenRouter API key (or OpenAI API key)
- Alpha Vantage API key (optional)
- NewsAPI key (optional)
- MCP broker server (for live trading)

## 🛠️ Installation

### 1. Clone and Setup Frontend

```bash
cd frontend
npm install
```

### 2. Install Additional Dependencies

```bash
npm install openai eventsource-parser zod ws cross-fetch
npm install --save-dev @types/ws
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# Required
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional (for real market data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
NEWSAPI_KEY=your_newsapi_key_here

# Broker Configuration
BROKER_ENV=paper
MCP_BROKER_URL=ws://localhost:8080/mcp
MCP_BROKER_HTTP_URL=http://localhost:8080/api

# App URLs
NEXT_PUBLIC_APP_NAME=Forecaster AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

### 4. Start Development Server

```bash
npm run dev
```

The AI Trading Chatbot will be available at `http://localhost:3000/chat`

## 🎯 Usage

### Basic Chat Interface

1. **Navigate to Chat**: Click "Chat with AI Trader" on the dashboard or go to `/chat`
2. **Choose Mode**: Toggle between "Analysis" and "Trade" modes
3. **Ask Questions**: 
   - "What's happening with NVDA?"
   - "Should I buy AAPL?"
   - "Show me technical analysis for MSFT"

### Trading Workflow

1. **Analysis First**: Ask for stock analysis and news
2. **Trade Request**: "Buy 5 shares of AAPL at market"
3. **Confirmation Dialog**: Review trade details and risks
4. **Mode Selection**: Choose paper or live trading
5. **Execute**: Confirm the trade with explicit acceptance

### Dashboard Integration

- **Portfolio Overview**: Real-time positions and balance
- **Quick Actions**: Direct links to chat with different modes
- **Position Tracking**: Detailed P&L and performance metrics

## 🔧 API Endpoints

### Chat API
- `POST /api/chat` - Main chat endpoint with streaming
- `POST /api/trade/confirm` - Trade confirmation with safety checks

### Market Data APIs
- `GET /api/tools/market/quote?symbol=AAPL` - Stock quotes
- `POST /api/tools/market/technicals` - Technical indicators
- `GET /api/tools/news?symbol=AAPL&days=3` - News aggregation

### Broker APIs
- `GET /api/tools/broker/positions` - Portfolio positions
- `GET /api/tools/broker/balance` - Account balance

## 🛡️ Safety Features

### Trade Confirmation
- **Two-step confirmation**: Checkbox + button confirmation
- **Risk acknowledgment**: Explicit acceptance of trading risks
- **Mode selection**: Paper vs live trading toggle
- **Rate limiting**: 1 confirmation per 3 seconds per user

### Logging & Monitoring
- **Comprehensive logging**: All trade attempts logged to database and files
- **Error handling**: Graceful fallbacks for API failures
- **Preview system**: Trade previews expire after 1 hour
- **User isolation**: Each user's trades are isolated

### Paper Trading
- **Simulated execution**: Safe testing environment
- **Realistic data**: Simulated prices and fills
- **Local storage**: Positions persist across sessions
- **Easy switching**: Toggle between paper and live modes

## 🔌 MCP Broker Integration

### MCP Server Setup

The system expects an MCP broker server running on `ws://localhost:8080/mcp` with these capabilities:

```typescript
interface MCPBroker {
  place_order(params: OrderParams): Promise<Order>;
  cancel_order(orderId: string): Promise<{success: boolean; message: string}>;
  get_positions(): Promise<Position[]>;
  get_balance(): Promise<Balance>;
}
```

### Custom Broker Implementation

To integrate with your broker:

1. **Implement MCP Server**: Create WebSocket server implementing the broker interface
2. **Update Environment**: Set `MCP_BROKER_URL` and `MCP_BROKER_HTTP_URL`
3. **Configure Authentication**: Add broker credentials to environment
4. **Test Integration**: Use paper mode first, then switch to live

### Example MCP Server

```javascript
// Simple MCP broker server example
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const request = JSON.parse(data);
    const { method, params, id } = request;
    
    try {
      let result;
      switch (method) {
        case 'place_order':
          result = await yourBrokerAPI.placeOrder(params);
          break;
        case 'get_positions':
          result = await yourBrokerAPI.getPositions();
          break;
        // ... other methods
      }
      
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id,
        error: { message: error.message }
      }));
    }
  });
});
```

## 📊 Market Data Sources

### Alpha Vantage (Primary)
- **Quotes**: Real-time stock prices and 52-week ranges
- **Technical Indicators**: Historical data for RSI, MACD, SMA, EMA
- **Rate Limits**: 5 calls/minute, 500 calls/day (free tier)

### NewsAPI (Secondary)
- **Financial News**: Filtered by trusted financial domains
- **Sentiment Analysis**: Automated bullish/bearish/neutral classification
- **Rate Limits**: 1000 requests/month (free tier)

### Fallback Simulation
- **Simulated Data**: When APIs are unavailable or rate-limited
- **Realistic Values**: Based on historical patterns
- **Consistent Experience**: Seamless fallback for demo purposes

## 🚨 Important Notes

### Trading Risks
- **Paper Trading Default**: Always starts in paper mode for safety
- **Real Money Warning**: Live trading uses real money - use with caution
- **No Financial Advice**: AI provides analysis, not investment advice
- **User Responsibility**: Users are responsible for all trading decisions

### API Limits
- **OpenAI**: Monitor usage and costs
- **Alpha Vantage**: Free tier has strict limits
- **NewsAPI**: Free tier limited to 1000 requests/month
- **Rate Limiting**: Built-in protection against excessive API calls

### Security
- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env.local` for local development
- **HTTPS**: Use HTTPS in production for all API calls
- **Authentication**: Implement proper user authentication for production

## 🐛 Troubleshooting

### Common Issues

**Chat not responding:**
- Check OpenAI API key in `.env.local`
- Verify network connectivity
- Check browser console for errors

**Market data not loading:**
- Verify Alpha Vantage API key
- Check API rate limits
- System will fallback to simulated data

**Trades not executing:**
- Ensure MCP broker server is running
- Check broker credentials
- Verify `BROKER_ENV` setting

**Dashboard not updating:**
- Check broker API endpoints
- Verify MCP client connection
- Refresh browser cache

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=forecaster:*
```

## 📈 Future Enhancements

- **Advanced Technical Analysis**: More indicators and charting
- **Portfolio Optimization**: AI-powered portfolio suggestions
- **Risk Management**: Stop-loss and take-profit automation
- **Multi-Asset Support**: Crypto, forex, and options trading
- **Social Features**: Share analysis and trade ideas
- **Mobile App**: React Native mobile application
- **Advanced AI**: Fine-tuned models for financial analysis

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**⚠️ Disclaimer**: This software is for educational and demonstration purposes. Trading involves substantial risk of loss and is not suitable for all investors. The AI assistant provides analysis and information but does not constitute financial advice. Always do your own research and consider consulting with a financial advisor before making investment decisions.
