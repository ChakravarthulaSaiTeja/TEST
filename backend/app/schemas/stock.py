from pydantic import BaseModel
from typing import Dict, Any, Optional


class StockData(BaseModel):
    symbol: str
    name: str
    current_price: float
    previous_close: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    high_52_week: Optional[float] = None
    low_52_week: Optional[float] = None


class TechnicalIndicators(BaseModel):
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    bollinger_upper: Optional[float] = None
    bollinger_lower: Optional[float] = None
    bollinger_middle: Optional[float] = None
    stochastic_k: Optional[float] = None
    stochastic_d: Optional[float] = None
    williams_r: Optional[float] = None
    cci: Optional[float] = None


class StockAnalysis(BaseModel):
    symbol: str
    technical_indicators: TechnicalIndicators
    fundamental_data: Dict[str, Any]
    recommendation: str
    confidence_score: float
