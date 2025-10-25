# expirationDateManagement_routes.py
from fastapi import APIRouter

router = APIRouter(prefix="/expiration", tags=["Expiration Date Management"])

@router.get("/")
def test_expiration():
    return {"message": "Ruta Expiration Date Management - En desarrollo"}

# Puedes agregar más endpoints aquí más adelante cuando desarrolles el modelo