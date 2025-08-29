from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def forex_root():
    return {"message": "Forex endpoints - to be implemented"}
