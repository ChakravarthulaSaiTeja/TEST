from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def portfolio_root():
    return {"message": "Portfolio management endpoints - to be implemented"}
