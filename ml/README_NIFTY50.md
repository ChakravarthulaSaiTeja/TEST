# Training LSTM Model for NIFTY 50 Index

This guide explains how to train the LSTM model specifically for the NIFTY 50 index.

## Prerequisites

- Python 3.8+ with required dependencies installed (see `requirements.txt`)
- Access to yfinance API (for downloading NIFTY 50 historical data)

## Training the Model

To train the LSTM model for NIFTY 50 index, use the symbol `^NSEI` (which is the yfinance symbol for NIFTY 50):

```bash
cd /Users/saitejachakravarthula/Desktop/Desktop/Test_1.0/TEST
source backend/venv/bin/activate  # or your Python environment
python ml/scripts/train_lstm.py --symbol "^NSEI"
```

### Training Parameters

You can customize training with additional parameters:

```bash
python ml/scripts/train_lstm.py \
  --symbol "^NSEI" \
  --sequence_length 60 \
  --hidden_size 128 \
  --num_layers 2 \
  --epochs 100 \
  --learning_rate 0.001 \
  --batch_size 32 \
  --test_split 0.2
```

### Model Output

After training, the following files will be created in `ml/scripts/models/`:
- `lstm_^nsei.pth` - Trained LSTM model weights
- `lstm_^nsei_scaler.pkl` - Feature scaler used during training

**Note:** The symbol is converted to lowercase in the filename, so `^NSEI` becomes `^nsei`.

## Using the Trained Model

Once trained, the model will be automatically used by:
- **Backend API**: `POST /api/v1/predictions/stock` with `{"symbol": "^NSEI", "timeframe": "7d"}`
- **SHAP Explainability**: `GET /api/v1/predictions/^NSEI/explain`
- **Frontend Dashboard**: The predictions page will automatically use the LSTM model for NIFTY 50 predictions

## Troubleshooting

### Model Not Found Error

If you see an error like "LSTM model or scaler not found", make sure:
1. The model has been trained using the command above
2. The model files exist in `ml/scripts/models/`
3. The symbol in API calls matches exactly: `^NSEI` (case-insensitive)

### Data Download Issues

If yfinance fails to download NIFTY 50 data:
- Check your internet connection
- Verify the symbol `^NSEI` is correct
- Try running the training script again (yfinance may have temporary API issues)

## Retraining

To retrain the model with fresh data, simply run the training command again. The old model files will be overwritten.
