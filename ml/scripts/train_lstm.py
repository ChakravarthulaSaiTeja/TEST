#!/usr/bin/env python3
"""
LSTM Model Training Script for Stock Price Prediction
Trading Intelligence Platform
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
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import yfinance as yf

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent / "backend"))

from app.services.ml_service import MLPredictionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LSTMModel(nn.Module):
    """LSTM model for stock price prediction"""

    def __init__(self, input_size, hidden_size, num_layers, output_size, dropout=0.2):
        super(LSTMModel, self).__init__()

        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
        )

        self.fc = nn.Linear(hidden_size, output_size)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # Initialize hidden state
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

        # Forward propagate LSTM
        out, _ = self.lstm(x, (h0, c0))

        # Decode the hidden state of the last time step
        out = self.dropout(out[:, -1, :])
        out = self.fc(out)

        return out


def prepare_data(symbol, sequence_length=60, test_split=0.2):
    """Prepare data for LSTM training"""

    logger.info(f"Downloading data for {symbol}")

    # Download stock data
    stock = yf.Ticker(symbol)
    data = stock.history(period="2y")

    if data.empty:
        raise ValueError(f"No data found for {symbol}")

    # Prepare features
    data["Returns"] = data["Close"].pct_change()
    data["Volume_Change"] = data["Volume"].pct_change()
    data["High_Low_Ratio"] = data["High"] / data["Low"]
    data["Price_Range"] = (data["High"] - data["Low"]) / data["Close"]

    # Add technical indicators
    data["SMA_20"] = data["Close"].rolling(window=20).mean()
    data["SMA_50"] = data["Close"].rolling(window=50).mean()
    data["RSI"] = calculate_rsi(data["Close"])

    # Drop NaN values
    data = data.dropna()

    # Select features
    feature_columns = [
        "Close",
        "Volume",
        "Returns",
        "Volume_Change",
        "High_Low_Ratio",
        "Price_Range",
        "SMA_20",
        "SMA_50",
        "RSI",
    ]

    features = data[feature_columns].values

    # Scale features
    scaler = MinMaxScaler()
    features_scaled = scaler.fit_transform(features)

    # Create sequences
    X, y = [], []
    for i in range(sequence_length, len(features_scaled)):
        X.append(features_scaled[i - sequence_length : i])
        y.append(features_scaled[i, 0])  # Predict close price

    X = np.array(X)
    y = np.array(y)

    # Split data
    split_idx = int(len(X) * (1 - test_split))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    logger.info(
        f"Data prepared: {X_train.shape[0]} training samples, {X_test.shape[0]} test samples"
    )

    return X_train, X_test, y_train, y_test, scaler


def calculate_rsi(prices, period=14):
    """Calculate RSI technical indicator"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def train_model(
    X_train,
    y_train,
    input_size,
    hidden_size=128,
    num_layers=2,
    epochs=100,
    learning_rate=0.001,
    batch_size=32,
):
    """Train the LSTM model"""

    logger.info("Initializing LSTM model")

    # Initialize model
    model = LSTMModel(
        input_size=input_size,
        hidden_size=hidden_size,
        num_layers=num_layers,
        output_size=1,
    )

    # Loss function and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # Data loader
    train_dataset = TensorDataset(
        torch.FloatTensor(X_train), torch.FloatTensor(y_train)
    )
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    # Training loop
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()

            # Forward pass
            outputs = model(batch_X)
            loss = criterion(outputs.squeeze(), batch_y)

            # Backward pass
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        if (epoch + 1) % 10 == 0:
            avg_loss = total_loss / len(train_loader)
            logger.info(f"Epoch [{epoch + 1}/{epochs}], Loss: {avg_loss:.6f}")

    logger.info("Training completed")
    return model


def evaluate_model(model, X_test, y_test, scaler):
    """Evaluate the trained model"""

    logger.info("Evaluating model")

    model.eval()
    with torch.no_grad():
        # Make predictions
        X_test_tensor = torch.FloatTensor(X_test)
        predictions = model(X_test_tensor).squeeze().numpy()

        # Inverse transform predictions
        predictions_original = scaler.inverse_transform(
            np.concatenate(
                [predictions.reshape(-1, 1), np.zeros((len(predictions), 8))], axis=1
            )
        )[:, 0]

        y_test_original = scaler.inverse_transform(
            np.concatenate([y_test.reshape(-1, 1), np.zeros((len(y_test), 8))], axis=1)
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


def save_model(model, scaler, symbol, model_dir="models"):
    """Save the trained model and scaler"""

    os.makedirs(model_dir, exist_ok=True)

    # Save PyTorch model
    model_path = os.path.join(model_dir, f"lstm_{symbol.lower()}.pth")
    torch.save(model.state_dict(), model_path)

    # Save scaler
    scaler_path = os.path.join(model_dir, f"lstm_{symbol.lower()}_scaler.pkl")
    import pickle

    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

    logger.info(f"Model saved to {model_path}")
    logger.info(f"Scaler saved to {scaler_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Train LSTM model for stock prediction"
    )
    parser.add_argument("--symbol", type=str, required=True, help="Stock symbol")
    parser.add_argument(
        "--sequence_length", type=int, default=60, help="Sequence length for LSTM"
    )
    parser.add_argument(
        "--hidden_size", type=int, default=128, help="Hidden size for LSTM"
    )
    parser.add_argument(
        "--num_layers", type=int, default=2, help="Number of LSTM layers"
    )
    parser.add_argument(
        "--epochs", type=int, default=100, help="Number of training epochs"
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
        logger.info(f"Starting LSTM training for {args.symbol}")

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
            num_layers=args.num_layers,
            epochs=args.epochs,
            learning_rate=args.learning_rate,
            batch_size=args.batch_size,
        )

        # Evaluate model
        results = evaluate_model(model, X_test, y_test, scaler)

        # Save model
        save_model(model, scaler, args.symbol)

        logger.info(f"LSTM training completed successfully for {args.symbol}")

    except Exception as e:
        logger.error(f"Error during training: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
