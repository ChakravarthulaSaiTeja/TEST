# 🚀 Trading Intelligence Platform - Setup Guide

This guide will help you set up and run the complete trading intelligence platform on your local machine.

## 🏗️ Project Structure

```
TEST/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   └── lib/            # Utility functions
│   ├── package.json
│   └── README.md
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Configuration & core services
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── schemas/        # Pydantic schemas
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt
├── ml/                      # Machine learning models
│   ├── scripts/            # Training scripts
│   ├── notebooks/          # Jupyter notebooks
│   ├── models/             # Trained model files
│   └── requirements.txt
├── db/                      # Database schemas
│   └── init.sql            # PostgreSQL initialization
├── infra/                   # Infrastructure & deployment
│   ├── docker-compose.yml  # Complete stack orchestration
│   ├── Dockerfile.backend  # Backend container
│   └── db/                 # Database setup
└── README.md               # Main project documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+** and pip
- **Docker** and Docker Compose
- **PostgreSQL** (optional, can use Docker)
- **Redis** (optional, can use Docker)

### 1. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Open http://localhost:8000/docs for API documentation
```

### 3. ML Models Setup

```bash
cd ml

# Install ML dependencies
pip install -r requirements.txt

# Train sample LSTM model
python scripts/train_lstm.py --symbol AAPL --epochs 50

# Start Jupyter notebook
jupyter notebook
```

### 4. Full Stack with Docker

```bash
cd infra

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔑 Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trading_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=your-secret-key-here

# External APIs
ALPHA_VANTAGE_API_KEY=your-key
NEWS_API_KEY=your-key
TWITTER_BEARER_TOKEN=your-token
BINANCE_API_KEY=your-key
BINANCE_SECRET_KEY=your-secret
```

## 📊 API Endpoints

### Core Endpoints
- `GET /api/v1/stocks/{symbol}` - Stock data
- `GET /api/v1/stocks/{symbol}/analysis` - Technical analysis
- `POST /api/v1/predictions/stock` - AI predictions
- `GET /api/v1/sentiment/{symbol}` - Sentiment analysis
- `GET /api/v1/portfolio` - User portfolio
- `GET /api/v1/news` - Financial news

### WebSocket
- `WS /ws/{client_id}` - Real-time market updates

## 🧠 Machine Learning Models

### Available Models
1. **LSTM** - Time series price prediction
2. **Prophet** - Trend forecasting
3. **XGBoost** - Ensemble predictions
4. **FinBERT** - Sentiment analysis

### Training Commands
```bash
# LSTM
python scripts/train_lstm.py --symbol AAPL --epochs 100

# Prophet
python scripts/train_prophet.py --symbol AAPL --periods 30

# XGBoost
python scripts/train_xgboost.py --symbol AAPL --cv_folds 5
```

## 🗄️ Database Setup

### PostgreSQL Schema
The database includes tables for:
- Users and authentication
- Stock data and technical indicators
- ML predictions and confidence scores
- User portfolios and positions
- News articles and sentiment
- API usage tracking

### Initialize Database
```bash
# Using Docker
docker-compose up postgres

# Or manually
psql -U postgres -d trading_platform -f db/init.sql
```

## 🔄 Data Sources

### Market Data
- **yfinance** - Yahoo Finance data
- **Alpha Vantage** - Real-time market data
- **Polygon.io** - High-frequency data

### News & Sentiment
- **NewsAPI.org** - Financial news
- **Twitter API** - Social sentiment
- **FinBERT** - AI sentiment analysis

### Crypto & Forex
- **Binance API** - Cryptocurrency data
- **Alpha Vantage** - Forex rates

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (AWS EC2)
```bash
cd backend
docker build -t trading-backend .
docker run -p 8000:8000 trading-backend
```

### ML Models (AWS SageMaker)
```bash
# Package models
python scripts/package_models.py

# Deploy to SageMaker
python scripts/deploy_sagemaker.py
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app
```

### API Tests
```bash
# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/stocks/AAPL
```

## 📈 Monitoring

### Application Metrics
- **Health Checks** - `/health` endpoint
- **Performance** - Response times and throughput
- **Errors** - Error rates and logs

### ML Model Monitoring
- **Accuracy** - Prediction accuracy over time
- **Drift** - Data distribution changes
- **Performance** - Model inference times

### Infrastructure
- **Docker** - Container health and resource usage
- **Database** - Connection pools and query performance
- **Redis** - Cache hit rates and memory usage

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using port 8000
   lsof -i :8000
   # Kill process or change port
   ```

2. **Database Connection**
   ```bash
   # Test PostgreSQL connection
   psql -h localhost -U user -d trading_platform
   ```

3. **Redis Connection**
   ```bash
   # Test Redis connection
   redis-cli ping
   ```

4. **ML Model Loading**
   ```bash
   # Check model files exist
   ls -la ml/models/
   # Verify model compatibility
   python -c "import torch; print(torch.__version__)"
   ```

### Logs
```bash
# Frontend logs
cd frontend && npm run dev

# Backend logs
cd backend && uvicorn main:app --reload

# Docker logs
docker-compose logs -f backend
```

## 📚 Next Steps

1. **Customize Models** - Adjust ML model parameters
2. **Add Data Sources** - Integrate additional APIs
3. **Enhance UI** - Add more charts and features
4. **Scale Infrastructure** - Deploy to cloud services
5. **Add Authentication** - Implement user management
6. **Real-time Trading** - Connect to broker APIs

## 🤝 Support

- **Documentation** - Check README files in each directory
- **Issues** - Report bugs and feature requests
- **Discussions** - Ask questions and share ideas

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Happy Trading! 🚀📈**
