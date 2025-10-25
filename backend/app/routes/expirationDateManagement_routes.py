from fastapi import APIRouter

router = APIRouter(prefix="/expiration", tags=["Expiration Date Management"])

@router.get("/")
def test_expiration():
    return {"message": "Ruta Expiration Date Management funcionando correctamente"}
