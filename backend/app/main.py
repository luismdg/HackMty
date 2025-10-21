from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
from app.routes import storm_routes, rainmap_routes 


app = FastAPI(title="Meteorological Backend")

# Allow CORS so frontend (localhost:3000) can access backend (localhost:8000) 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # React dev server
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Include routers 
app.include_router(storm_routes.router, prefix="/storm", tags=["Storm"]) 
app.include_router(rainmap_routes.router, prefix="/rainmap", tags=["Rainmap"])

@app.get("/") 
async def root(): 
    return {"message": "Backend running successfully"}