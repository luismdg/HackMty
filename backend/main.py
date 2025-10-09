from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predictions

app = FastAPI()

# CORS setup for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include predictions routes
app.include_router(predictions.router, prefix="")

@app.get("/")
def read_root():
    return {"message": "Weather API running"}
