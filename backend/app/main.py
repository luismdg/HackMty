from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from app.routes import storm_routes, rainmap_routes
from pathlib import Path
import json
import glob
import os

app = FastAPI(title="Meteorological Backend")

# Allow CORS so frontend (localhost:3000) can access backend (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent.parent / "Data"


def get_latest_directory():
    """Devuelve el directorio más reciente en /Data"""
    dirs = [d for d in DATA_DIR.glob("*") if d.is_dir()]
    if not dirs:
        return None
    return max(dirs, key=os.path.getmtime)
    
# Include routers
app.include_router(storm_routes.router, prefix="/storm", tags=["Storm"])
app.include_router(rainmap_routes.router, prefix="/rainmap", tags=["Rainmap"])


@app.get("/")
async def root():
    return {"message": "Backend running successfully"}

# RUTAS JSON =========================

@app.get("/api/storms")
def get_all_storms():
    """Devuelve el JSON general más reciente (todas las tormentas)."""
    latest_dir = get_latest_directory()
    if not latest_dir:
        raise HTTPException(status_code=404, detail="No hay datos generados aún.")

    json_dir = latest_dir / "JSON"
    json_files = sorted(json_dir.glob("tormentas*.json"))
    if not json_files:
        raise HTTPException(status_code=404, detail="No se encontró el JSON general.")

    latest_json = json_files[-1]
    with open(latest_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse(content=data)

@app.get("/api/storms/{storm_id}")
def get_single_storm(storm_id: str):
    """Devuelve el JSON individual de una tormenta específica."""
    latest_dir = get_latest_directory()
    if not latest_dir:
        raise HTTPException(status_code=404, detail="No hay datos generados aún.")

    json_path = latest_dir / "JSON" / f"tormenta_{storm_id}.json"
    if not json_path.exists():
        raise HTTPException(status_code=404, detail=f"No se encontró el archivo JSON de la tormenta {storm_id}.")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse(content=data)


#RUTAS MAPAS =========================

@app.get("/api/maps")
def get_general_map():
    """Devuelve el mapa general más reciente con todas las tormentas."""
    latest_dir = get_latest_directory()
    if not latest_dir:
        raise HTTPException(status_code=404, detail="No hay mapas generados aún.")

    map_dir = latest_dir / "Mapas"
    map_files = sorted(map_dir.glob("mapa_*.png"))
    if not map_files:
        raise HTTPException(status_code=404, detail="No se encontró el mapa general.")

    latest_map = map_files[-1]
    return FileResponse(latest_map, media_type="image/png")

@app.get("/api/maps/{storm_id}")
def get_storm_map(storm_id: str):
    """Devuelve el mapa individual de una tormenta específica."""
    latest_dir = get_latest_directory()
    if not latest_dir:
        raise HTTPException(status_code=404, detail="No hay mapas generados aún.")

    map_path = latest_dir / "Mapas" / f"{storm_id}.png"
    if not map_path.exists():
        raise HTTPException(status_code=404, detail=f"No se encontró el mapa de la tormenta {storm_id}.")

    return FileResponse(map_path, media_type="image/png")
