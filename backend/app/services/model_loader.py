"""
Model Loader Service
Loads and provides predictions from LSTM, GRU, and Attention LSTM models
"""

import sys
import logging
import pickle
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, date
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler

# Optional imports for ML functionality
try:
    import torch
    import torch.nn as nn

    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None
    nn = None

logger = logging.getLogger(__name__)

# Ensure ml/scripts is on the path
PROJECT_ROOT = Path(__file__).resolve().parents[3]
ML_SCRIPTS_DIR = PROJECT_ROOT / "ml" / "scripts"
MODEL_DIR = ML_SCRIPTS_DIR / "models"

if str(ML_SCRIPTS_DIR) not in sys.path:
    sys.path.append(str(ML_SCRIPTS_DIR))


if TORCH_AVAILABLE:

    class LSTMModel(nn.Module):
        """LSTM model architecture - EXACT notebook"""

        def __init__(self, input_size, output_size=1):
            super(LSTMModel, self).__init__()
            # Layer 1: LSTM(128, return_sequences=True) + Dropout(0.3)
            self.lstm1 = nn.LSTM(
                input_size=input_size, hidden_size=128, num_layers=1, batch_first=True
            )
            self.dropout1 = nn.Dropout(0.3)
            # Layer 2: LSTM(64, return_sequences=True) + Dropout(0.3)
            self.lstm2 = nn.LSTM(
                input_size=128, hidden_size=64, num_layers=1, batch_first=True
            )
            self.dropout2 = nn.Dropout(0.3)
            # Layer 3: LSTM(32) + Dropout(0.2)
            self.lstm3 = nn.LSTM(
                input_size=64, hidden_size=32, num_layers=1, batch_first=True
            )
            self.dropout3 = nn.Dropout(0.2)
            # Output: Dense(1)
            self.fc = nn.Linear(32, output_size)

        def forward(self, x):
            out, _ = self.lstm1(x)
            out = self.dropout1(out)
            out, _ = self.lstm2(out)
            out = self.dropout2(out)
            out, _ = self.lstm3(out)
            out = self.dropout3(out[:, -1, :])
            out = self.fc(out)
            return out
else:
    LSTMModel = None


if TORCH_AVAILABLE:

    class GRUModel(nn.Module):
        """GRU model architecture - EXACT notebook"""

        def __init__(self, input_size, output_size=1):
            super(GRUModel, self).__init__()
            # Layer 1: GRU(128, return_sequences=True) + Dropout(0.3)
            self.gru1 = nn.GRU(
                input_size=input_size, hidden_size=128, num_layers=1, batch_first=True
            )
            self.dropout1 = nn.Dropout(0.3)
            # Layer 2: GRU(64) + Dropout(0.2)
            self.gru2 = nn.GRU(
                input_size=128, hidden_size=64, num_layers=1, batch_first=True
            )
            self.dropout2 = nn.Dropout(0.2)
            # Output: Dense(1)
            self.fc = nn.Linear(64, output_size)

        def forward(self, x):
            out, _ = self.gru1(x)
            out = self.dropout1(out)
            out, _ = self.gru2(out)
            out = self.dropout2(out[:, -1, :])
            out = self.fc(out)
            return out
else:
    GRUModel = None


if TORCH_AVAILABLE:

    class AttentionLayer(nn.Module):
        """Attention mechanism for LSTM"""

        def __init__(self, hidden_size):
            super(AttentionLayer, self).__init__()
            self.hidden_size = hidden_size
            self.attention = nn.Linear(hidden_size, 1)

        def forward(self, lstm_output):
            attention_weights = self.attention(lstm_output)
            attention_weights = torch.nn.functional.softmax(attention_weights, dim=1)
            attended_output = torch.sum(attention_weights * lstm_output, dim=1)
            return attended_output

    class AttentionLSTMModel(nn.Module):
        """Attention LSTM model architecture - EXACT notebook"""

        def __init__(self, input_size, output_size=1):
            super(AttentionLSTMModel, self).__init__()
            # Layer 1: LSTM(128, return_sequences=True) + Dropout(0.3)
            self.lstm1 = nn.LSTM(
                input_size=input_size, hidden_size=128, num_layers=1, batch_first=True
            )
            self.dropout1 = nn.Dropout(0.3)
            # Attention layer
            self.attention = AttentionLayer(128)
            # Layer 2: LSTM(64) + Dropout(0.2)
            self.lstm2 = nn.LSTM(
                input_size=128, hidden_size=64, num_layers=1, batch_first=True
            )
            self.dropout2 = nn.Dropout(0.2)
            # Output: Dense(1)
            self.fc = nn.Linear(64, output_size)

        def forward(self, x):
            lstm1_out, _ = self.lstm1(x)
            lstm1_out = self.dropout1(lstm1_out)
            attended = self.attention(lstm1_out)
            attended = attended.unsqueeze(1)
            lstm2_out, _ = self.lstm2(attended)
            lstm2_out = self.dropout2(lstm2_out[:, -1, :])
            out = self.fc(lstm2_out)
            return out
else:
    AttentionLayer = None
    AttentionLSTMModel = None


class ModelLoader:
    """Service to load and use trained models"""

    def __init__(self, model_dir: Path = MODEL_DIR):
        self.model_dir = model_dir
        self.models: Dict[str, Any] = {}
        self.scalers: Dict[str, Any] = {}
        self.model_configs: Dict[str, Dict[str, Any]] = {}

    def _load_model(
        self, model_type: str, symbol: str
    ) -> Tuple[Optional[nn.Module], Optional[Any]]:
        """Load a trained model and its scaler"""
        if not TORCH_AVAILABLE:
            logger.warning(f"PyTorch not available. Cannot load {model_type} model.")
            return None, None

        symbol_lower = symbol.lower()
        model_path = self.model_dir / f"{model_type}_{symbol_lower}.pth"
        scaler_path = self.model_dir / f"{model_type}_{symbol_lower}_scaler.pkl"

        if not model_path.exists() or not scaler_path.exists():
            logger.warning(f"Model files not found for {model_type} {symbol}")
            return None, None

        try:
            # Load scaler
            with open(scaler_path, "rb") as f:
                scaler = pickle.load(f)

            # Determine input size from scaler (assuming 4 features like notebook: Close, MA_20, MA_50, Volatility)
            input_size = 4  # Default for notebook-based models
            sequence_length = 120  # Default from notebook

            # Load model architecture
            if not TORCH_AVAILABLE or LSTMModel is None:
                logger.error("PyTorch not available or models not defined")
                return None, None

            if model_type == "lstm":
                model = LSTMModel(input_size=input_size, output_size=1)
            elif model_type == "gru":
                model = GRUModel(input_size=input_size, output_size=1)
            elif model_type == "attention_lstm":
                model = AttentionLSTMModel(input_size=input_size, output_size=1)
            else:
                logger.error(f"Unknown model type: {model_type}")
                return None, None

            # Load model weights
            state_dict = torch.load(model_path, map_location="cpu")
            try:
                model.load_state_dict(state_dict, strict=True)
            except RuntimeError as e:
                # Check if this is an architecture mismatch
                if "Missing key" in str(e) or "Unexpected key" in str(e):
                    logger.error(
                        f"Model architecture mismatch for {model_type} {symbol}. "
                        f"The saved model uses an old architecture. "
                        f"Please retrain the model with the new architecture."
                    )
                    raise RuntimeError(
                        f"Model architecture mismatch. The saved {model_type} model for {symbol} was trained with an old architecture. "
                        f"Please retrain the model. Run: cd ml/scripts && python train_{model_type}.py --symbol {symbol} --epochs 200"
                    ) from e
                else:
                    raise
            model.eval()

            logger.info(f"Successfully loaded {model_type} model for {symbol}")
            return model, scaler

        except Exception as e:
            logger.error(
                f"Error loading {model_type} model for {symbol}: {e}", exc_info=True
            )
            return None, None

    def load_models(self, symbol: str) -> Dict[str, bool]:
        """Load all available models for a symbol"""
        results = {}
        for model_type in ["lstm", "gru", "attention_lstm"]:
            model, scaler = self._load_model(model_type, symbol)
            if model is not None and scaler is not None:
                key = f"{model_type}_{symbol.lower()}"
                self.models[key] = model
                self.scalers[key] = scaler
                results[model_type] = True
            else:
                results[model_type] = False
        return results

    def _prepare_data_for_prediction(
        self, symbol: str, sequence_length: int = 120
    ) -> Optional[np.ndarray]:
        """Prepare the most recent sequence for prediction (matching notebook approach)"""
        try:
            # Download stock data (20 years like notebook)
            end = date.today()
            start = datetime(end.year - 20, end.month, end.day)

            stock = yf.Ticker(symbol)
            data = stock.history(start=start, end=end)

            if data.empty:
                logger.error(f"No data found for {symbol}")
                return None

            # Add features like notebook
            data["MA_20"] = data["Close"].rolling(20).mean()
            data["MA_50"] = data["Close"].rolling(50).mean()
            data["Volatility"] = data["Close"].rolling(20).std()

            data.dropna(inplace=True)

            if len(data) < sequence_length:
                logger.error(
                    f"Insufficient data for {symbol}: need {sequence_length}, got {len(data)}"
                )
                return None

            # Select features (matching notebook)
            features = data[["Close", "MA_20", "MA_50", "Volatility"]].values

            # Get the most recent sequence
            sequence = features[-sequence_length:]

            return sequence

        except Exception as e:
            logger.error(f"Error preparing data for {symbol}: {e}", exc_info=True)
            return None

    def predict(
        self, model_type: str, symbol: str, sequence_data: Optional[np.ndarray] = None
    ) -> Optional[float]:
        """Make a prediction using a loaded model"""
        if not TORCH_AVAILABLE:
            return None

        key = f"{model_type}_{symbol.lower()}"
        if key not in self.models or key not in self.scalers:
            logger.warning(f"Model {model_type} not loaded for {symbol}")
            return None

        try:
            model = self.models[key]
            scaler = self.scalers[key]

            # Prepare sequence data if not provided
            if sequence_data is None:
                sequence_data = self._prepare_data_for_prediction(
                    symbol, sequence_length=120
                )
                if sequence_data is None:
                    return None

            # Scale the sequence using the model's scaler
            sequence_scaled = scaler.transform(sequence_data)

            # Prepare input
            input_tensor = torch.FloatTensor(sequence_scaled).unsqueeze(
                0
            )  # Add batch dimension

            # Make prediction
            with torch.no_grad():
                prediction_scaled = model(input_tensor).squeeze().item()

            # Inverse transform (matching notebook approach)
            # Need to pad with zeros for other features
            prediction_array = np.array([[prediction_scaled, 0, 0, 0]])
            prediction_original = scaler.inverse_transform(prediction_array)[0, 0]

            return float(prediction_original)

        except Exception as e:
            logger.error(
                f"Error making prediction with {model_type} for {symbol}: {e}",
                exc_info=True,
            )
            return None

    def get_available_models(self, symbol: str) -> Dict[str, bool]:
        """Check which models are available for a symbol"""
        available = {}
        for model_type in ["lstm", "gru", "attention_lstm"]:
            model_path = self.model_dir / f"{model_type}_{symbol.lower()}.pth"
            scaler_path = self.model_dir / f"{model_type}_{symbol.lower()}_scaler.pkl"
            available[model_type] = model_path.exists() and scaler_path.exists()
        return available
