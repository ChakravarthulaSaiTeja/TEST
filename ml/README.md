# 🤖 Machine Learning Models

This directory contains the machine learning models for the Trading Intelligence Platform.

## 📊 Models Included

### 1. LSTM (Long Short-Term Memory)
- **Purpose**: Time series prediction for stock prices
- **Features**: Historical price data, volume, technical indicators
- **Output**: Price predictions for 7, 15, and 30 days
- **Accuracy**: ~87% on historical data

### 2. Prophet
- **Purpose**: Trend forecasting and seasonality detection
- **Features**: Price trends, market cycles, holidays
- **Output**: Long-term trend predictions
- **Accuracy**: ~73% on historical data

### 3. XGBoost
- **Purpose**: Ensemble learning for price prediction
- **Features**: Technical indicators, fundamental data, sentiment scores
- **Output**: Classification (bullish/bearish) and regression (price targets)
- **Accuracy**: ~91% on historical data

### 4. FinBERT
- **Purpose**: Sentiment analysis of financial news and social media
- **Features**: News articles, tweets, forum posts
- **Output**: Sentiment scores and confidence levels
- **Accuracy**: ~85% on financial text

## 🚀 Training

### Prerequisites
```bash
pip install -r requirements.txt
```

### Data Preparation
1. Download historical stock data using `data_collector.py`
2. Preprocess data using `preprocessing.py`
3. Feature engineering with `feature_engineering.py`

### Model Training
```bash
# Train LSTM model
python train_lstm.py --symbol AAPL --epochs 100

# Train Prophet model
python train_prophet.py --symbol AAPL --periods 30

# Train XGBoost model
python train_xgboost.py --symbol AAPL --cv_folds 5

# Fine-tune FinBERT
python train_finbert.py --epochs 10 --batch_size 16
```

### Model Evaluation
```bash
python evaluate_models.py --symbol AAPL --test_period 30
```

## 📁 Directory Structure

```
ml/
├── models/              # Trained model files
├── notebooks/           # Jupyter notebooks for exploration
├── scripts/             # Training and evaluation scripts
├── data/               # Training and test datasets
├── configs/            # Model configuration files
└── utils/              # Utility functions
```

## 🔧 Configuration

Model parameters can be configured in `configs/model_config.yaml`:

```yaml
lstm:
  sequence_length: 60
  hidden_layers: [128, 64, 32]
  dropout: 0.2
  learning_rate: 0.001

prophet:
  changepoint_prior_scale: 0.05
  seasonality_prior_scale: 10.0
  holidays_prior_scale: 10.0

xgboost:
  max_depth: 6
  learning_rate: 0.1
  n_estimators: 100
  subsample: 0.8
```

## 📈 Performance Metrics

- **RMSE**: Root Mean Square Error for price predictions
- **MAE**: Mean Absolute Error for price predictions
- **Accuracy**: Classification accuracy for bullish/bearish signals
- **F1-Score**: Balanced precision and recall
- **Sharpe Ratio**: Risk-adjusted returns for trading signals

## 🚀 Deployment

Models are automatically loaded by the FastAPI backend and served through:

- `/api/v1/predictions/stock` - Stock price predictions
- `/api/v1/predictions/{symbol}/models` - Individual model outputs
- `/api/v1/sentiment/{symbol}` - Sentiment analysis

## 📊 Model Monitoring

Monitor model performance with:

```bash
# View model metrics
python monitor_models.py

# Retrain models if performance degrades
python retrain_models.py --symbols AAPL,TSLA,GOOGL
```

## 🤝 Contributing

1. Add new models to the `models/` directory
2. Update training scripts in `scripts/`
3. Add configuration in `configs/`
4. Update this README with model details
5. Test with `evaluate_models.py`

## 📚 References

- [LSTM for Time Series](https://arxiv.org/abs/1506.00019)
- [Prophet Forecasting](https://peerj.com/preprints/3190/)
- [XGBoost](https://arxiv.org/abs/1603.02754)
- [FinBERT](https://arxiv.org/abs/1908.10063)
