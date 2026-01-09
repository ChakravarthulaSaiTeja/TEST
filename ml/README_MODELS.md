# ML Models Training Guide

This directory contains training scripts for three neural network models for stock price prediction:

1. **LSTM** - Long Short-Term Memory network
2. **GRU** - Gated Recurrent Unit network  
3. **Attention LSTM** - LSTM with attention mechanism

All models are based on the fine-tuned notebook architecture and use the same feature set:
- Close price
- MA_20 (20-day moving average)
- MA_50 (50-day moving average)
- Volatility (20-day rolling standard deviation)

## Training Scripts

### LSTM Model
```bash
cd ml/scripts
python train_lstm.py --symbol "^NSEI" --epochs 200 --sequence_length 120
```

### GRU Model
```bash
cd ml/scripts
python train_gru.py --symbol "^NSEI" --epochs 200 --sequence_length 120
```

### Attention LSTM Model
```bash
cd ml/scripts
python train_attention_lstm.py --symbol "^NSEI" --epochs 200 --sequence_length 120
```

## Model Architecture

### LSTM
- 3-layer LSTM architecture
- Hidden size: 128
- Dropout: 0.3, 0.3, 0.2
- Sequence length: 120 days

### GRU
- 2-layer GRU architecture
- First layer: 128 units
- Second layer: 64 units
- Dropout: 0.3, 0.2
- Sequence length: 120 days

### Attention LSTM
- LSTM + Attention mechanism
- First LSTM: 128 units
- Attention layer
- Second LSTM: 64 units
- Dropout: 0.3, 0.2
- Sequence length: 120 days

## Model Files

After training, models are saved to `ml/scripts/models/`:
- `{model_type}_{symbol}.pth` - Model weights
- `{model_type}_{symbol}_scaler.pkl` - Feature scaler

Example:
- `lstm_^nsei.pth`
- `lstm_^nsei_scaler.pkl`
- `gru_^nsei.pth`
- `gru_^nsei_scaler.pkl`
- `attention_lstm_^nsei.pth`
- `attention_lstm_^nsei_scaler.pkl`

## Training All Models

To train all three models for NIFTY 50:

```bash
cd ml/scripts

# Train LSTM
python train_lstm.py --symbol "^NSEI" --epochs 200

# Train GRU
python train_gru.py --symbol "^NSEI" --epochs 200

# Train Attention LSTM
python train_attention_lstm.py --symbol "^NSEI" --epochs 200
```

## Model Evaluation

All models are evaluated using:
- RMSE (Root Mean Squared Error)
- MAE (Mean Absolute Error)
- Accuracy (within 2% of actual price)

The training scripts will output these metrics after training completes.

## Backend Integration

The backend automatically loads all available models and uses them for predictions:
- `backend/app/services/model_loader.py` - Loads and manages all models
- `backend/app/services/ml_service.py` - Uses models for predictions
- `backend/app/api/v1/endpoints/predictions.py` - API endpoints

## Notes

- All models use the same data preparation pipeline
- Models are trained on 20 years of historical data
- Early stopping and learning rate reduction are used during training
- Models are saved in PyTorch format (.pth files)
