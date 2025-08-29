from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def sentiment_root():
    return {"message": "Sentiment analysis endpoints - to be implemented"}
