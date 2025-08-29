from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def crypto_root():
    return {"message": "Cryptocurrency endpoints - to be implemented"}
