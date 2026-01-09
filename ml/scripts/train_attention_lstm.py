#!/usr/bin/env python3
"""
Attention LSTM Model Training Script for Stock Price Prediction
Trading Intelligence Platform
Based on fine-tuned notebook architecture
"""

import argparse
import logging
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import yfinance as yf

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent / "backend"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AttentionLayer(nn.Module):
    """Attention mechanism for LSTM"""

    def __init__(self, hidden_size):
        super(AttentionLayer, self).__init__()
        self.hidden_size = hidden_size
        self.attention = nn.Linear(hidden_size, 1)

    def forward(self, lstm_output):
        # lstm_output shape: (batch_size, seq_len, hidden_size)
        attention_weights = self.attention(lstm_output)  # (batch_size, seq_len, 1)
        attention_weights = F.softmax(attention_weights, dim=1)

        # Apply attention weights
        attended_output = torch.sum(
            attention_weights * lstm_output, dim=1
        )  # (batch_size, hidden_size)
        return attended_output


class AttentionLSTMModel(nn.Module):
    """Attention LSTM model for stock price prediction - EXACT notebook architecture"""

    def __init__(self, input_size, output_size=1):
        super(AttentionLSTMModel, self).__init__()

        # Layer 1: LSTM(128, return_sequences=True) + Dropout(0.3) - EXACT notebook
        self.lstm1 = nn.LSTM(
            input_size=input_size,
            hidden_size=128,
            num_layers=1,
            batch_first=True,
        )
        self.dropout1 = nn.Dropout(0.3)

        # Attention layer - EXACT notebook
        self.attention = AttentionLayer(128)

        # Layer 2: LSTM(64) + Dropout(0.2) - EXACT notebook
        self.lstm2 = nn.LSTM(
            input_size=128,
            hidden_size=64,
            num_layers=1,
            batch_first=True,
        )
        self.dropout2 = nn.Dropout(0.2)

        # Output: Dense(1) - EXACT notebook
        self.fc = nn.Linear(64, output_size)

    def forward(self, x):
        # Forward propagate through first LSTM
        lstm1_out, _ = self.lstm1(x)
        lstm1_out = self.dropout1(lstm1_out)

        # Apply attention
        attended = self.attention(lstm1_out)
        # Reshape for second LSTM (add sequence dimension)
        attended = attended.unsqueeze(1)  # (batch_size, 1, hidden_size)

        # Forward propagate through second LSTM
        lstm2_out, _ = self.lstm2(attended)
        lstm2_out = self.dropout2(lstm2_out[:, -1, :])  # Take last time step

        # Output layer
        out = self.fc(lstm2_out)

        return out


def calculate_rsi(prices, period=14):
    """Calculate RSI indicator"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def prepare_data(symbol, sequence_length=120, test_split=0.2):
    """Prepare data for Attention LSTM training - matching notebook approach"""

    logger.info(f"Downloading data for {symbol}")

    # Download stock data (20 years like notebook)
    from datetime import datetime, date

    end = date.today()
    start = datetime(end.year - 20, end.month, end.day)

    stock = yf.Ticker(symbol)
    data = stock.history(start=start, end=end)

    if data.empty:
        raise ValueError(f"No data found for {symbol}")

    # Add features like notebook
    data["MA_20"] = data["Close"].rolling(20).mean()
    data["MA_50"] = data["Close"].rolling(50).mean()
    data["Volatility"] = data["Close"].rolling(20).std()

    data.dropna(inplace=True)

    # Select features (matching notebook)
    features = data[["Close", "MA_20", "MA_50", "Volatility"]]

    # Scale data
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(features)

    # Create sequences
    X, y = [], []
    for i in range(sequence_length, len(scaled_data)):
        X.append(scaled_data[i - sequence_length : i])
        y.append(scaled_data[i, 0])  # Predict Close price

    X, y = np.array(X), np.array(y)

    # Split data
    train_size = int(len(X) * (1 - test_split))
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]

    logger.info(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")
    logger.info(f"Input shape: {X_train.shape}")

    return X_train, X_test, y_train, y_test, scaler


def train_model(
    X_train,
    y_train,
    input_size,
    hidden_size=128,
    epochs=200,
    learning_rate=0.001,
    batch_size=32,
    validation_split=0.1,
):
    """Train the Attention LSTM model with early stopping and learning rate reduction"""

    logger.info("Initializing Attention LSTM model")

    # Initialize model EXACTLY like notebook
    model = AttentionLSTMModel(input_size=input_size, output_size=1)

    # Loss function and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # Split validation set
    val_size = int(len(X_train) * validation_split)
    X_val = X_train[-val_size:]
    y_val = y_train[-val_size:]
    X_train_sub = X_train[:-val_size]
    y_train_sub = y_train[:-val_size]

    # Data loaders
    train_dataset = TensorDataset(
        torch.FloatTensor(X_train_sub), torch.FloatTensor(y_train_sub)
    )
    val_dataset = TensorDataset(torch.FloatTensor(X_val), torch.FloatTensor(y_val))
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    # Training with early stopping
    best_val_loss = float("inf")
    patience = 10
    patience_counter = 0
    best_model_state = None

    for epoch in range(epochs):
        # Training phase
        model.train()
        total_loss = 0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs.squeeze(), batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        # Validation phase
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for batch_X, batch_y in val_loader:
                outputs = model(batch_X)
                loss = criterion(outputs.squeeze(), batch_y)
                val_loss += loss.item()

        avg_train_loss = total_loss / len(train_loader)
        avg_val_loss = val_loss / len(val_loader)

        # Learning rate reduction
        if epoch > 0 and avg_val_loss >= best_val_loss:
            patience_counter += 1
            if patience_counter >= 5:
                for param_group in optimizer.param_groups:
                    param_group["lr"] *= 0.5
                    if param_group["lr"] < 1e-5:
                        param_group["lr"] = 1e-5
                patience_counter = 0
        else:
            patience_counter = 0

        # Early stopping
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            best_model_state = model.state_dict().copy()
            patience_counter = 0
        elif patience_counter >= patience:
            logger.info(f"Early stopping at epoch {epoch + 1}")
            model.load_state_dict(best_model_state)
            break

        if (epoch + 1) % 10 == 0:
            logger.info(
                f"Epoch [{epoch + 1}/{epochs}], Train Loss: {avg_train_loss:.6f}, Val Loss: {avg_val_loss:.6f}"
            )

    logger.info("Training completed")
    return model


def evaluate_model(model, X_test, y_test, scaler):
    """Evaluate the trained model"""

    logger.info("Evaluating model")

    model.eval()
    with torch.no_grad():
        X_test_tensor = torch.FloatTensor(X_test)
        predictions = model(X_test_tensor).squeeze().numpy()

        # Inverse transform predictions (matching notebook approach)
        predictions_original = scaler.inverse_transform(
            np.concatenate(
                (predictions.reshape(-1, 1), np.zeros((len(predictions), 3))), axis=1
            )
        )[:, 0]

        y_test_original = scaler.inverse_transform(
            np.concatenate((y_test.reshape(-1, 1), np.zeros((len(y_test), 3))), axis=1)
        )[:, 0]

        # Calculate metrics
        mse = mean_squared_error(y_test_original, predictions_original)
        mae = mean_absolute_error(y_test_original, predictions_original)
        rmse = np.sqrt(mse)

        # Calculate accuracy (within 2% of actual price)
        accuracy = np.mean(
            np.abs(predictions_original - y_test_original) / y_test_original < 0.02
        )

        logger.info(f"Evaluation Results:")
        logger.info(f"MSE: {mse:.4f}")
        logger.info(f"MAE: {mae:.4f}")
        logger.info(f"RMSE: {rmse:.4f}")
        logger.info(f"Accuracy (within 2%): {accuracy:.2%}")

        return {
            "mse": mse,
            "mae": mae,
            "rmse": rmse,
            "accuracy": accuracy,
            "predictions": predictions_original,
            "actual": y_test_original,
        }


def save_model(model, scaler, symbol, model_dir=None):
    """Save the trained model and scaler"""

    # Default to ml/scripts/models directory
    if model_dir is None:
        script_dir = Path(__file__).parent.absolute()
        model_dir = script_dir / "models"
    else:
        model_dir = Path(model_dir)

    os.makedirs(model_dir, exist_ok=True)

    # Save PyTorch model (.pth format)
    model_path = model_dir / f"attention_lstm_{symbol.lower()}.pth"
    torch.save(model.state_dict(), model_path)
    logger.info(f"Attention LSTM model saved to {model_path}")

    # Save scaler (.pkl format)
    scaler_path = model_dir / f"attention_lstm_{symbol.lower()}_scaler.pkl"
    import pickle

    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

    logger.info(f"Scaler saved to {scaler_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Train Attention LSTM model for stock prediction"
    )
    parser.add_argument("--symbol", type=str, required=True, help="Stock symbol")
    parser.add_argument(
        "--sequence_length",
        type=int,
        default=120,
        help="Sequence length (lookback period)",
    )
    parser.add_argument(
        "--hidden_size", type=int, default=128, help="Hidden size for LSTM"
    )
    parser.add_argument(
        "--epochs", type=int, default=200, help="Number of training epochs"
    )
    parser.add_argument(
        "--learning_rate", type=float, default=0.001, help="Learning rate"
    )
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument(
        "--test_split", type=float, default=0.2, help="Test split ratio"
    )

    args = parser.parse_args()

    try:
        logger.info(f"Starting Attention LSTM training for {args.symbol}")

        # Prepare data
        X_train, X_test, y_train, y_test, scaler = prepare_data(
            args.symbol, args.sequence_length, args.test_split
        )

        # Train model
        model = train_model(
            X_train,
            y_train,
            input_size=X_train.shape[2],
            hidden_size=args.hidden_size,
            epochs=args.epochs,
            learning_rate=args.learning_rate,
            batch_size=args.batch_size,
        )

        # Evaluate model
        results = evaluate_model(model, X_test, y_test, scaler)

        # Save model
        save_model(model, scaler, args.symbol)

        logger.info(f"Attention LSTM training completed successfully for {args.symbol}")
        logger.info(f"Final RMSE: {results['rmse']:.4f}")
        logger.info(f"Final Accuracy: {results['accuracy']:.2%}")

    except Exception as e:
        logger.error(f"Error during training: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
