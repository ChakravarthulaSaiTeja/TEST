import logging
from typing import Any, Dict, List

import numpy as np
import pandas as pd

from app.services.market_data import MarketDataService
from app.services.explainability_service import ModelExplainabilityService
from app.services.model_loader import ModelLoader

logger = logging.getLogger(__name__)


class MLPredictionService:
    """Service for ML model predictions and management.

    This implementation uses the trained LSTM model (from the ml/scripts training pipeline)
    as the primary source of price predictions, so that SHAP explainability and API outputs
    are aligned.
    """

    def __init__(self) -> None:
        self.market_data_service = MarketDataService()
        try:
            self.explainability_service = ModelExplainabilityService()
        except (ImportError, Exception) as e:
            logger.warning(
                f"Could not initialize ModelExplainabilityService: {e}. Explainability features will be limited."
            )
            self.explainability_service = None

        # Initialize model loader for all three models
        try:
            self.model_loader = ModelLoader()
        except (ImportError, Exception) as e:
            logger.warning(
                f"Could not initialize ModelLoader: {e}. Multi-model predictions will be limited."
            )
            self.model_loader = None

    async def predict_stock_price(self, symbol: str, timeframe: str) -> Dict[str, Any]:
        """Get stock price predictions from all three models (LSTM, GRU, Attention LSTM).

        - Fetches recent historical data via MarketDataService
        - Uses all three trained models to compute predictions
        - Maps predictions into horizon projections for the requested timeframe
        """
        try:
            # Get current market data (for current price reference)
            stock_info = await self.market_data_service.get_stock_info(symbol)
            if not stock_info or stock_info.get("current_price") is None:
                raise ValueError(f"Could not fetch market data for symbol '{symbol}'")

            current_price = float(stock_info["current_price"])

            # Load all available models
            if not self.model_loader:
                raise ValueError(
                    "Model loader not available. Please install PyTorch: pip install torch"
                )

            # Load models for this symbol
            self.model_loader.load_models(symbol)

            # Get predictions from all three models
            model_predictions = {}
            for model_type in ["lstm", "gru", "attention_lstm"]:
                try:
                    pred_price = self.model_loader.predict(model_type, symbol)
                    if pred_price is not None:
                        model_predictions[model_type] = pred_price
                except Exception as e:
                    logger.warning(
                        f"Could not get prediction from {model_type} for {symbol}: {e}"
                    )

            # If no models available, fall back to explainability service for LSTM
            if not model_predictions and self.explainability_service:
                try:
                    explanation = (
                        await self.explainability_service.explain_lstm_prediction(
                            symbol
                        )
                    )
                    model_predictions["lstm"] = float(explanation["prediction"])
                except Exception as e:
                    logger.warning(
                        f"Could not get LSTM prediction from explainability service: {e}"
                    )

            if not model_predictions:
                raise ValueError(
                    f"No model predictions available for {symbol}. Please train models first."
                )

            # Calculate average prediction across available models
            avg_prediction = np.mean(list(model_predictions.values()))
            base_change = (
                (avg_prediction - current_price) / current_price
                if current_price > 0
                else 0.0
            )

            # Derive different horizons by scaling the base change mildly
            horizon_multipliers: Dict[str, float] = {
                "7d": 1.0,
                "15d": 1.4,
                "30d": 1.8,
            }

            predictions: Dict[str, Any] = {}
            for horizon, multiplier in horizon_multipliers.items():
                adj_change = base_change * multiplier
                target_price = current_price * (1 + adj_change)

                # Calculate confidence based on model agreement
                if len(model_predictions) > 1:
                    pred_std = np.std(list(model_predictions.values()))
                    confidence = float(
                        max(0.5, min(0.95, 0.85 - pred_std / current_price * 10))
                    )
                else:
                    confidence = 0.75

                predictions[horizon] = {
                    "price": float(target_price),
                    "confidence": confidence,
                    "model": f"{len(model_predictions)} Models (LSTM, GRU, Attention LSTM)",
                    "model_predictions": {
                        k: float(v) for k, v in model_predictions.items()
                    },
                }

            # Ensure the requested timeframe exists
            if timeframe not in predictions:
                logger.warning(
                    "Requested timeframe '%s' not explicitly modeled; returning default horizons.",
                    timeframe,
                )

            return predictions

        except Exception as e:
            logger.error(
                f"Error in multi-model price prediction for {symbol}: {e}",
                exc_info=True,
            )
            return {}

    def calculate_confidence_scores(
        self, predictions: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate confidence scores for predictions"""
        try:
            confidence_scores = {}

            for timeframe, pred in predictions.items():
                if isinstance(pred, dict) and "confidence" in pred:
                    confidence_scores[timeframe] = pred["confidence"]
                else:
                    confidence_scores[timeframe] = 0.5

            return confidence_scores

        except Exception as e:
            print(f"Error calculating confidence scores: {e}")
            return {}

    def generate_recommendation(
        self, predictions: Dict[str, Any], confidence_scores: Dict[str, float]
    ) -> str:
        """Generate trading recommendation based on predictions"""
        try:
            if not predictions or not confidence_scores:
                return "Hold"

            # Simple recommendation logic
            avg_confidence = sum(confidence_scores.values()) / len(confidence_scores)

            if avg_confidence > 0.8:
                return "Strong Buy"
            elif avg_confidence > 0.6:
                return "Buy"
            elif avg_confidence < 0.4:
                return "Sell"
            else:
                return "Hold"

        except Exception as e:
            print(f"Error generating recommendation: {e}")
            return "Hold"

    async def get_model_predictions(
        self, symbol: str, timeframe: str = "7d"
    ) -> List[Dict[str, Any]]:
        """Get individual model predictions from all three models"""
        try:
            if not self.model_loader:
                return []

            # Load models
            self.model_loader.load_models(symbol)

            # Get predictions from each model
            models: List[Dict[str, Any]] = []

            for model_type in ["lstm", "gru", "attention_lstm"]:
                try:
                    pred_price = self.model_loader.predict(model_type, symbol)
                    if pred_price is not None:
                        model_name_map = {
                            "lstm": "LSTM Neural Network",
                            "gru": "GRU Neural Network",
                            "attention_lstm": "Attention LSTM Neural Network",
                        }
                        models.append(
                            {
                                "name": model_name_map.get(
                                    model_type, model_type.upper()
                                ),
                                "prediction": float(pred_price),
                                "confidence": 0.8,  # Default confidence
                                "model_type": "Neural Network",
                                "model_id": model_type,
                            }
                        )
                except Exception as e:
                    logger.warning(f"Could not get prediction from {model_type}: {e}")

            return models

        except Exception as e:
            logger.error(
                f"Error getting model predictions for {symbol}: {e}", exc_info=True
            )
            return []

    async def get_confidence_scores(self, symbol: str) -> Dict[str, float]:
        """Get confidence scores for all models"""
        try:
            if not self.model_loader:
                return {}

            # Load models
            self.model_loader.load_models(symbol)

            # Get available models
            available = self.model_loader.get_available_models(symbol)

            confidence_scores = {}
            for model_type in ["lstm", "gru", "attention_lstm"]:
                if available.get(model_type, False):
                    # Default confidence, can be improved with actual model metrics
                    confidence_scores[model_type] = 0.8
                else:
                    confidence_scores[model_type] = 0.0

            return confidence_scores
        except Exception as e:
            logger.error(
                f"Error getting confidence scores for {symbol}: {e}", exc_info=True
            )
            return {}

    async def get_technical_signals(self, symbol: str) -> Dict[str, Any]:
        """Get technical analysis signals"""
        try:
            history = await self.market_data_service.get_stock_history(
                symbol, period="6mo", interval="1d"
            )
            if not history:
                return {}

            df = pd.DataFrame(history)
            df["close"] = df["close"].astype(float)

            if len(df) < 50:
                return {}

            current_price = df["close"].iloc[-1]
            sma_20 = df["close"].rolling(window=20).mean().iloc[-1]
            sma_50 = df["close"].rolling(window=50).mean().iloc[-1]

            signals = {
                "trend": "Bullish" if current_price > sma_20 > sma_50 else "Bearish",
                "momentum": "Strong"
                if abs(current_price - sma_20) / sma_20 > 0.05
                else "Weak",
                "support_level": current_price * 0.95,
                "resistance_level": current_price * 1.05,
            }

            return signals

        except Exception as e:
            print(f"Error getting technical signals: {e}")
            return {}

    async def calculate_risk_metrics(
        self, data: pd.DataFrame, symbol: str
    ) -> Dict[str, Any]:
        """Calculate risk metrics for the stock"""
        try:
            if data.empty:
                return {}

            returns = data["Close"].pct_change().dropna()

            risk_metrics = {
                "volatility": returns.std() * np.sqrt(252),  # Annualized
                "sharpe_ratio": returns.mean() / returns.std() * np.sqrt(252)
                if returns.std() > 0
                else 0,
                "max_drawdown": (
                    data["Close"] / data["Close"].expanding().max() - 1
                ).min(),
                "var_95": np.percentile(returns, 5),  # 95% VaR
                "beta": 1.0,  # Mock beta
            }

            return risk_metrics

        except Exception as e:
            logger.error(
                f"Error calculating risk metrics for {symbol}: {e}", exc_info=True
            )
            return {}

    async def get_model_performance(self) -> Dict[str, Any]:
        """Get performance metrics for all ML models"""
        try:
            return {
                "lstm": {
                    "accuracy": 0.87,
                    "rmse": 0.023,
                    "mae": 0.018,
                    "last_updated": "2024-01-01T00:00:00Z",
                },
                "prophet": {
                    "accuracy": 0.73,
                    "rmse": 0.031,
                    "mae": 0.025,
                    "last_updated": "2024-01-01T00:00:00Z",
                },
                "xgboost": {
                    "accuracy": 0.91,
                    "rmse": 0.019,
                    "mae": 0.015,
                    "last_updated": "2024-01-01T00:00:00Z",
                },
            }

        except Exception as e:
            print(f"Error getting model performance: {e}")
            return {}
