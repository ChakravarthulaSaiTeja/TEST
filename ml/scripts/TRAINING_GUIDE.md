# Model Training Guide

This guide explains how to train all three models (LSTM, GRU, Attention LSTM) and save them for use in predictions.

## Model Storage Format

Models are saved in the following format:
- **Model weights**: `.pth` files (PyTorch format)
- **Scalers**: `.pkl` files (Pickle format)

All models are saved to: `ml/scripts/models/`

## Quick Start: Train All Models

The easiest way to train all three models is using the `train_all_models.py` script:

```bash
cd TEST/ml/scripts
python train_all_models.py
```

This will:
1. Train LSTM model (200 epochs)
2. Train GRU model (200 epochs)
3. Train Attention LSTM model (200 epochs)
4. Save all models to `ml/scripts/models/`
5. Display a summary of saved models

## Training Individual Models

You can also train models individually:

### LSTM Model
```bash
cd TEST/ml/scripts
python train_lstm.py --symbol "^NSEI" --epochs 200 --sequence_length 120
```

### GRU Model
```bash
cd TEST/ml/scripts
python train_gru.py --symbol "^NSEI" --epochs 200 --sequence_length 120
```

### Attention LSTM Model
```bash
cd TEST/ml/scripts
python train_attention_lstm.py --symbol "^NSEI" --epochs 200 --sequence_length 120
```

## Model Files Created

After training, you'll have the following files in `ml/scripts/models/`:

```
ml/scripts/models/
├── lstm_^nsei.pth                    # LSTM model weights
├── lstm_^nsei_scaler.pkl            # LSTM scaler
├── gru_^nsei.pth                    # GRU model weights
├── gru_^nsei_scaler.pkl             # GRU scaler
├── attention_lstm_^nsei.pth          # Attention LSTM model weights
└── attention_lstm_^nsei_scaler.pkl  # Attention LSTM scaler
```

## Using Trained Models for Predictions

Once models are trained and saved, the backend will automatically:
1. Load models from `ml/scripts/models/` when making predictions
2. Use the saved scalers to preprocess input data
3. Generate predictions using the trained model weights

The `ModelLoader` service in the backend handles all model loading automatically.

## Training Parameters

All models use the same training parameters (matching the notebook):
- **Sequence Length (LOOKBACK)**: 120 days
- **Epochs**: 200
- **Batch Size**: 32
- **Learning Rate**: 0.001
- **Features**: Close, MA_20, MA_50, Volatility (4 features)
- **Data Period**: 20 years of historical data

## Verification

After training, verify models were saved correctly:

```bash
ls -lh TEST/ml/scripts/models/
```

You should see all 6 files (3 models + 3 scalers) with recent timestamps.

## Notes

- Training can take 30-60 minutes per model depending on your hardware
- Models are trained on 20 years of historical data for NIFTY 50 (^NSEI)
- The models use the exact architecture from the fine-tuned notebook
- All models are saved in PyTorch format (.pth) for efficient loading
