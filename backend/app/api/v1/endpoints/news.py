from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def news_root():
    return {"message": "News and sentiment endpoints - to be implemented"}
