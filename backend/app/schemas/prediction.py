from pydantic import BaseModel
from typing import Dict, Any, List


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
