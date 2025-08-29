from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

from app.core.cache import cache_manager
from app.services.ml_service import MLPredictionService
from app.schemas.prediction import (
    PredictionRequest,
    ModelPrediction,
    PredictionResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()
ml_service = MLPredictionService()


@router.post("/stock")
async def predict_stock_price(request: PredictionRequest) -> PredictionResponse:
    """Get AI-powered stock price prediction"""
    try:
        # Try to get from cache first
        cache_key = f"prediction_{request.symbol.lower()}_{request.timeframe}"
        cached_prediction = await cache_manager.get(cache_key)

        if cached_prediction:
            return PredictionResponse(**cached_prediction)

        # Get prediction from ML service
        prediction = await ml_service.predict_stock_price(
            request.symbol, request.timeframe
        )

        # Cache the prediction
        await cache_manager.set(cache_key, prediction.dict(), expire=300)

        return prediction

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

        # Get predictions from all models
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
        confidence = await ml_service.get_confidence_scores(symbol)

        # Cache the confidence scores
        await cache_manager.set(cache_key, confidence, expire=300)

        return confidence

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
        # Try to get from cache first
        cache_key = "model_performance"
        cached_performance = await cache_manager.get(cache_key)

        if cached_performance:
            return cached_performance

        # Get model performance
        performance = await ml_service.get_model_performance()

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
        # Try to get from cache first
        cache_key = "model_status"
        cached_status = await cache_manager.get(cache_key)

        if cached_status:
            return cached_status

        # Get model status
        status = {
            "timestamp": datetime.now().isoformat(),
            "models": {
                "lstm": {
                    "status": "active",
                    "last_trained": "2024-01-15T10:00:00Z",
                    "accuracy": 0.78,
                    "version": "1.2.0",
                },
                "prophet": {
                    "status": "active",
                    "last_trained": "2024-01-15T10:00:00Z",
                    "accuracy": 0.82,
                    "version": "1.1.0",
                },
                "xgboost": {
                    "status": "active",
                    "last_trained": "2024-01-15T10:00:00Z",
                    "accuracy": 0.75,
                    "version": "1.0.0",
                },
                "finbert": {
                    "status": "active",
                    "last_trained": "2024-01-15T10:00:00Z",
                    "accuracy": 0.71,
                    "version": "1.3.0",
                },
            },
            "overall_status": "healthy",
        }

        # Cache the status
        await cache_manager.set(cache_key, status, expire=300)

        return status

    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get model status: {str(e)}"
        )
