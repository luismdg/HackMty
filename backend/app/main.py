from fastapi import FastAPI
from app.routes import (
    products_routes,
    consumptionPredictor_routes,  # Esta es tu nueva ruta
    productivityEstimation_routes,
    data_routes,
    expirationDateManagement_routes
)

app = FastAPI(title="GateGroup Hack Backend")

# Registrar routers
app.include_router(products_routes.router)
app.include_router(consumptionPredictor_routes.router)  # Agrega esta línea
app.include_router(productivityEstimation_routes.router)
app.include_router(data_routes.router)
app.include_router(expirationDateManagement_routes.router)

@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente 🚀"}