#!/bin/bash
# Quick script to retrain LSTM model with new architecture

echo "=========================================="
echo "Retraining LSTM Model with New Architecture"
echo "=========================================="
echo ""
echo "This will retrain the LSTM model for NIFTY 50 (^NSEI)"
echo "with the updated architecture matching the notebook."
echo ""
echo "Training parameters:"
echo "  - Symbol: ^NSEI"
echo "  - Epochs: 200"
echo "  - Sequence Length: 120"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

cd "$(dirname "$0")"
python train_lstm.py --symbol "^NSEI" --epochs 200 --sequence_length 120

echo ""
echo "=========================================="
echo "Training Complete!"
echo "=========================================="
echo ""
echo "The model has been saved to: ml/scripts/models/"
echo "You can now use the explainability features."
