from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    stocks,
    predictions,
    sentiment,
    portfolio,
    news,
    crypto,
    forex,
    membership,
    oauth,
    chat,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(oauth.router, prefix="/oauth", tags=["oauth"])
api_router.include_router(membership.router, prefix="/membership", tags=["membership"])
api_router.include_router(stocks.router, prefix="/stocks", tags=["stocks"])
api_router.include_router(
    predictions.router, prefix="/predictions", tags=["predictions"]
)
api_router.include_router(sentiment.router, prefix="/sentiment", tags=["sentiment"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(crypto.router, prefix="/crypto", tags=["cryptocurrency"])
api_router.include_router(forex.router, prefix="/forex", tags=["forex"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
