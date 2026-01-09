from datetime import datetime
from typing import Any, Dict, List

from pydantic import BaseModel


class PredictionRequest(BaseModel):
    symbol: str
    timeframe: str


class ModelPrediction(BaseModel):
    name: str
    prediction: float
    confidence: float
    model_type: str


class PredictionResponse(BaseModel):
    symbol: str
    timeframe: str
    predictions: Dict[str, Any]
    confidence_scores: Dict[str, float]
    recommendation: str
    timestamp: str


class FeatureAttribution(BaseModel):
    name: str
    importance: float


class LSTMExplainabilityResponse(BaseModel):
    symbol: str
    prediction: float
    model_output: float
    base_value: float
    feature_importances: List[FeatureAttribution]
    timestamp: datetime
    model_type: str = "lstm"
