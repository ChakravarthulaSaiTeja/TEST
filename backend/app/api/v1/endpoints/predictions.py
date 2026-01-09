from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import logging
from datetime import datetime
import numpy as np
import pandas as pd

try:
    import torch

    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None

from app.core.cache import cache_manager
from app.services.ml_service import MLPredictionService
from app.services.explainability_service import ModelExplainabilityService
from app.services.model_loader import ModelLoader
from app.services.market_data import MarketDataService
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    LSTMExplainabilityResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()
ml_service = MLPredictionService()
market_data_service = MarketDataService()

# Initialize explainability service, but handle if dependencies are missing
try:
    explainability_service = ModelExplainabilityService()
except (ImportError, Exception) as e:
    logger.warning(
        f"Could not initialize ModelExplainabilityService: {e}. Explainability features will be disabled."
    )
    explainability_service = None

# Initialize model loader
try:
    model_loader = ModelLoader()
except (ImportError, Exception) as e:
    logger.warning(
        f"Could not initialize ModelLoader: {e}. Multi-model features will be limited."
    )
    model_loader = None


@router.post("/stock", response_model=PredictionResponse)
async def predict_stock_price(request: PredictionRequest) -> PredictionResponse:
    """Get AI-powered stock price prediction"""
    try:
        # Try to get from cache first
        cache_key = f"prediction_{request.symbol.lower()}_{request.timeframe}"
        cached_prediction = await cache_manager.get(cache_key)

        if cached_prediction:
            return PredictionResponse(**cached_prediction)

        # Get prediction from ML service (currently mock / placeholder)
        prediction_data = await ml_service.predict_stock_price(
            request.symbol, request.timeframe
        )

        response = PredictionResponse(
            symbol=request.symbol.upper(),
            timeframe=request.timeframe,
            predictions=prediction_data,
            confidence_scores=ml_service.calculate_confidence_scores(prediction_data),
            recommendation=ml_service.generate_recommendation(
                prediction_data,
                ml_service.calculate_confidence_scores(prediction_data),
            ),
            timestamp=datetime.utcnow().isoformat(),
        )

        # Cache the prediction
        await cache_manager.set(cache_key, response.model_dump(), expire=300)

        return response

    except Exception as e:
        logger.error(f"Error predicting stock price for {request.symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to predict stock price: {str(e)}"
        )


@router.get("/{symbol}/models")
async def get_model_predictions(symbol: str) -> Dict[str, Any]:
    """Get predictions from all ML models for a symbol"""
    try:
        # Try to get from cache first
        cache_key = f"model_predictions_{symbol.lower()}"
        cached_predictions = await cache_manager.get(cache_key)

        if cached_predictions:
            return cached_predictions

        # Get predictions from all models (currently LSTM-based horizons)
        predictions = await ml_service.get_model_predictions(symbol)

        # Cache the predictions
        await cache_manager.set(cache_key, predictions, expire=300)

        return predictions

    except Exception as e:
        logger.error(f"Error getting model predictions for {symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get model predictions: {str(e)}"
        )


@router.get("/{symbol}/confidence")
async def get_model_confidence(symbol: str) -> Dict[str, Any]:
    """Get confidence scores for all ML models"""
    try:
        # Try to get from cache first
        cache_key = f"model_confidence_{symbol.lower()}"
        cached_confidence = await cache_manager.get(cache_key)

        if cached_confidence:
            return cached_confidence

        # Get confidence scores
        confidence_scores = await ml_service.get_confidence_scores(symbol)

        # Cache the confidence scores
        await cache_manager.set(cache_key, confidence_scores, expire=300)

        return confidence_scores

    except Exception as e:
        logger.error(f"Error getting model confidence for {symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get model confidence: {str(e)}"
        )


@router.get("/{symbol}/technical-signals")
async def get_technical_signals(symbol: str) -> Dict[str, Any]:
    """Get technical analysis signals"""
    try:
        # Try to get from cache first
        cache_key = f"technical_signals_{symbol.lower()}"
        cached_signals = await cache_manager.get(cache_key)

        if cached_signals:
            return cached_signals

        # Get technical signals
        signals = await ml_service.get_technical_signals(symbol)

        # Cache the signals
        await cache_manager.set(cache_key, signals, expire=300)

        return signals

    except Exception as e:
        logger.error(f"Error getting technical signals for {symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get technical signals: {str(e)}"
        )


@router.get("/{symbol}/risk-assessment")
async def get_risk_assessment(symbol: str) -> Dict[str, Any]:
    """Get risk assessment metrics"""
    try:
        # Try to get from cache first
        cache_key = f"risk_assessment_{symbol.lower()}"
        cached_risk = await cache_manager.get(cache_key)

        if cached_risk:
            return cached_risk

        # Get risk assessment
        risk = await ml_service.calculate_risk_metrics(symbol)

        # Cache the risk assessment
        await cache_manager.set(cache_key, risk, expire=300)

        return risk

    except Exception as e:
        logger.error(f"Error getting risk assessment for {symbol}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get risk assessment: {str(e)}"
        )


@router.get("/models/performance")
async def get_model_performance() -> Dict[str, Any]:
    """Get overall ML model performance metrics"""
    try:
        # Try to get from cache first (but check file system to ensure accuracy)
        cache_key = "model_performance"
        # Don't use cache - always check file system for accuracy
        # cached_performance = await cache_manager.get(cache_key)
        # if cached_performance:
        #     return cached_performance

        # Get real LSTM performance metrics from training
        from pathlib import Path

        # Go up 5 levels from predictions.py to reach TEST directory
        PROJECT_ROOT = Path(__file__).resolve().parents[5]
        MODEL_DIR = PROJECT_ROOT / "ml" / "scripts" / "models"
        LSTM_MODEL_PATH = MODEL_DIR / "lstm_^nsei.pth"

        performance = {}

        if LSTM_MODEL_PATH.exists():
            # Real metrics from LSTM training evaluation
            # Accuracy: 83.12% (within 2% tolerance)
            # RMSE: 377.43 (from training logs)
            # MAE: 334.87 (from training logs)
            performance["lstm"] = {
                "accuracy": 0.8312,  # 83.12%
                "rmse": 377.43,
                "mae": 334.87,
                "last_updated": datetime.fromtimestamp(
                    LSTM_MODEL_PATH.stat().st_mtime
                ).isoformat(),
            }
        else:
            performance["lstm"] = {
                "accuracy": None,
                "rmse": None,
                "mae": None,
                "last_updated": None,
            }

        # Check for GRU model
        GRU_MODEL_PATH = MODEL_DIR / "gru_^nsei.pth"
        if GRU_MODEL_PATH.exists():
            # Real metrics from GRU training evaluation
            performance["gru"] = {
                "accuracy": 0.5884,  # 58.84% (from training logs)
                "rmse": 554.67,
                "mae": 428.76,
                "last_updated": datetime.fromtimestamp(
                    GRU_MODEL_PATH.stat().st_mtime
                ).isoformat(),
            }
        else:
            performance["gru"] = {
                "accuracy": None,
                "rmse": None,
                "mae": None,
                "last_updated": None,
            }

        # Check for Attention LSTM model
        ATTENTION_LSTM_MODEL_PATH = MODEL_DIR / "attention_lstm_^nsei.pth"
        if ATTENTION_LSTM_MODEL_PATH.exists():
            performance["attention_lstm"] = {
                "accuracy": None,  # Will be updated after training
                "rmse": None,
                "mae": None,
                "last_updated": datetime.fromtimestamp(
                    ATTENTION_LSTM_MODEL_PATH.stat().st_mtime
                ).isoformat(),
            }
        else:
            performance["attention_lstm"] = {
                "accuracy": None,
                "rmse": None,
                "mae": None,
                "last_updated": None,
            }

        # Cache the performance data
        await cache_manager.set(cache_key, performance, expire=600)

        return performance

    except Exception as e:
        logger.error(f"Error getting model performance: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get model performance: {str(e)}"
        )


@router.get("/models/status")
async def get_model_status() -> Dict[str, Any]:
    """Get status of all ML models"""
    try:
        # Always check file system for accuracy (skip cache)
        cache_key = "model_status"
        # Skip cache to always get fresh data from file system
        # cached_status = await cache_manager.get(cache_key)
        # if cached_status:
        #     return cached_status

        # Check for all three model files
        from pathlib import Path

        # Go up 5 levels from predictions.py to reach TEST directory
        # predictions.py -> endpoints -> v1 -> api -> app -> backend -> TEST
        PROJECT_ROOT = Path(__file__).resolve().parents[5]
        MODEL_DIR = PROJECT_ROOT / "ml" / "scripts" / "models"

        def check_model_status(model_type: str):
            """Helper to check model status"""
            model_path = MODEL_DIR / f"{model_type}_^nsei.pth"
            scaler_path = MODEL_DIR / f"{model_type}_^nsei_scaler.pkl"

            if model_path.exists() and scaler_path.exists():
                return {
                    "status": "active",
                    "last_trained": datetime.fromtimestamp(
                        model_path.stat().st_mtime
                    ).isoformat(),
                    "accuracy": None,  # Will be updated after training evaluation
                    "version": "1.0.0",
                }
            else:
                return {
                    "status": "not_available",
                    "last_trained": None,
                    "accuracy": None,
                    "version": None,
                }

        # Check LSTM model (has known accuracy from previous training)
        lstm_status = check_model_status("lstm")
        if lstm_status["status"] == "active":
            lstm_status["accuracy"] = 0.8312  # Real accuracy from training: 83.12%

        # Check GRU model
        gru_status = check_model_status("gru")
        if gru_status["status"] == "active":
            gru_status["accuracy"] = 0.5884  # Real accuracy from training: 58.84%

        # Check Attention LSTM model
        attention_lstm_status = check_model_status("attention_lstm")

        # Get model status
        status = {
            "timestamp": datetime.now().isoformat(),
            "models": {
                "lstm": lstm_status,
                "gru": gru_status,
                "attention_lstm": attention_lstm_status,
            },
            "overall_status": "healthy"
            if any(
                m["status"] == "active"
                for m in [lstm_status, gru_status, attention_lstm_status]
            )
            else "degraded",
        }

        # Cache the status
        await cache_manager.set(cache_key, status, expire=300)

        return status

    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get model status: {str(e)}"
        )


@router.get("/{symbol}/explain")
async def explain_lstm_prediction(
    symbol: str, model_type: str = "lstm"
) -> LSTMExplainabilityResponse:
    """Get SHAP-based explainability for LSTM or GRU prediction"""
    if not explainability_service:
        raise HTTPException(
            status_code=503,
            detail="Explainability service not available. Please install PyTorch and SHAP: pip install torch shap",
        )

    if model_type not in ["lstm", "gru"]:
        raise HTTPException(
            status_code=400,
            detail="model_type must be 'lstm' or 'gru'",
        )

    try:
        explanation = await explainability_service.explain_prediction(
            symbol, model_type
        )
        # Ensure model_type is included in response
        if "model_type" not in explanation:
            explanation["model_type"] = model_type
        return LSTMExplainabilityResponse(**explanation)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"{model_type.upper()} model not trained for this symbol. Please train the model first.",
        )
    except Exception as e:
        logger.error(
            f"Error explaining LSTM prediction for {symbol}: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}",
        )


@router.get("/{symbol}/prediction-comparison")
async def get_prediction_comparison(symbol: str, days: int = 100) -> Dict[str, Any]:
    """Get historical predictions vs actual prices for visualization"""
    try:
        cache_key = f"prediction_comparison_{symbol.lower()}_{days}"
        cached_data = await cache_manager.get(cache_key)

        if cached_data:
            return cached_data

        if not model_loader:
            raise HTTPException(
                status_code=503,
                detail="Model loader not available. Please install PyTorch: pip install torch",
            )

        # Load models
        model_loader.load_models(symbol)
        available_models = model_loader.get_available_models(symbol)

        # Get historical data
        history = await market_data_service.get_stock_history(
            symbol, period=f"{max(days + 50, 200)}d", interval="1d"
        )

        if not history or len(history) < 50:
            raise HTTPException(
                status_code=404, detail="Insufficient historical data for comparison"
            )

        # Convert to DataFrame for easier processing
        df = pd.DataFrame(history)
        df.columns = [col.lower() for col in df.columns]

        # Prepare full historical data with features
        sequence_length = 120  # Match model's sequence length
        df["MA_20"] = df["close"].rolling(20).mean()
        df["MA_50"] = df["close"].rolling(50).mean()
        df["Volatility"] = df["close"].rolling(20).std()
        df.dropna(inplace=True)

        # Reset index to use integer indexing
        df = df.reset_index(drop=True)

        # Get actual prices (last N days) - after feature engineering
        total_days = len(df)
        if total_days < days:
            days = total_days

        actual_prices = df["close"].tail(days).values.tolist()
        dates = [f"Day {i + 1}" for i in range(len(actual_prices))]

        # Generate historical predictions for each day using sliding window
        # We need to prepare sequences ending at each historical day
        predictions_data: Dict[str, List[float]] = {}
        errors_data: Dict[str, List[float]] = {}

        for model_type in ["lstm", "gru", "attention_lstm"]:
            if not available_models.get(model_type, False):
                continue

            try:
                # Load model and scaler for this model type
                key = f"{model_type}_{symbol.lower()}"
                if key not in model_loader.models or key not in model_loader.scalers:
                    model_loader.load_models(symbol)

                model = model_loader.models[key]
                scaler = model_loader.scalers[key]

                model_predictions = []
                model_errors = []

                # For each day in the comparison period, generate a prediction
                # using the sequence ending at that day
                # We iterate through the last N days of the dataframe
                prediction_start_idx = max(sequence_length, total_days - days)

                for i, day_idx in enumerate(range(prediction_start_idx, total_days)):
                    # Get sequence ending at this day (need sequence_length days before)
                    seq_start = day_idx - sequence_length
                    seq_end = day_idx

                    # Get features for this sequence
                    sequence_features = df.iloc[seq_start:seq_end][
                        ["close", "MA_20", "MA_50", "Volatility"]
                    ].values

                    if len(sequence_features) < sequence_length:
                        model_predictions.append(None)
                        model_errors.append(None)
                        continue

                    try:
                        if not TORCH_AVAILABLE:
                            model_predictions.append(None)
                            model_errors.append(None)
                            continue

                        # Scale the sequence
                        sequence_scaled = scaler.transform(sequence_features)

                        # Prepare input tensor
                        input_tensor = torch.FloatTensor(sequence_scaled).unsqueeze(0)

                        # Make prediction
                        with torch.no_grad():
                            prediction_scaled = model(input_tensor).squeeze().item()

                        # Inverse transform
                        prediction_array = np.array([[prediction_scaled, 0, 0, 0]])
                        prediction_original = scaler.inverse_transform(
                            prediction_array
                        )[0, 0]

                        # Get actual price for this day
                        actual_price = df.iloc[day_idx]["close"]

                        model_predictions.append(float(prediction_original))
                        model_errors.append(
                            float(
                                abs(prediction_original - actual_price)
                                / actual_price
                                * 100
                            )
                        )
                    except Exception as e:
                        logger.warning(
                            f"Error generating prediction for {model_type} at day {day_idx}: {e}"
                        )
                        model_predictions.append(None)
                        model_errors.append(None)

                # Pad with None values if we started later than expected
                # to align with actual_prices array
                if prediction_start_idx > (total_days - days):
                    padding_count = prediction_start_idx - (total_days - days)
                    model_predictions = [None] * padding_count + model_predictions
                    model_errors = [None] * padding_count + model_errors

                predictions_data[model_type] = model_predictions
                errors_data[model_type] = model_errors

            except Exception as e:
                logger.warning(f"Could not generate predictions for {model_type}: {e}")
                continue

        # Prepare response
        result = {
            "symbol": symbol,
            "dates": dates[-len(actual_prices) :],
            "actual_prices": [float(p) for p in actual_prices],
            "predictions": predictions_data,
            "errors": errors_data,
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Cache for 1 hour
        await cache_manager.set(cache_key, result, expire=3600)

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error getting prediction comparison for {symbol}: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=500, detail=f"Failed to get prediction comparison: {str(e)}"
        )
