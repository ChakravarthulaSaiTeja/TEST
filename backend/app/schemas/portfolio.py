from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PortfolioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PositionBase(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    quantity: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    transaction_type: str = Field(..., pattern="^(buy|sell)$")


class PositionCreate(PositionBase):
    pass


class PositionResponse(BaseModel):
    id: int
    symbol: str
    quantity: float
    average_price: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    weight: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    transaction_type: str = Field(..., pattern="^(buy|sell|dividend|split)$")
    quantity: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    commission: Optional[float] = Field(0, ge=0)
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(BaseModel):
    id: int
    portfolio_id: int
    symbol: str
    transaction_type: str
    quantity: float
    price: float
    total_amount: float
    commission: float
    transaction_date: datetime
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WatchlistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class WatchlistCreate(WatchlistBase):
    pass


class WatchlistUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class WatchlistResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WatchlistSymbolBase(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    notes: Optional[str] = None


class WatchlistSymbolCreate(WatchlistSymbolBase):
    pass


class WatchlistSymbolResponse(BaseModel):
    id: int
    watchlist_id: int
    symbol: str
    notes: Optional[str] = None
    added_at: datetime

    class Config:
        from_attributes = True


class PortfolioSummary(BaseModel):
    total_cost: float
    total_market_value: float
    total_unrealized_pnl: float
    total_return_percent: float
    position_count: int


class PortfolioDetails(PortfolioResponse):
    positions: List[PositionResponse]
    summary: PortfolioSummary


class WatchlistDetails(WatchlistResponse):
    symbols: List[WatchlistSymbolResponse]


class MarketData(BaseModel):
    current_price: float
    change: float
    change_percent: float
    volume: int
    timestamp: datetime


class PositionWithMarketData(PositionResponse):
    market_data: MarketData


class PortfolioPerformance(BaseModel):
    portfolio_id: int
    period: str
    positions: List[PositionResponse]
    total_value: float
    total_cost: float
    total_pnl: float
    total_pnl_percent: float
