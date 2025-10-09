# Weather Prediction App

This is a full-stack weather prediction web app for Mexico. It uses:

- **Backend:** Python + FastAPI + ML models (Scikit-learn / XGBoost)
- **Frontend:** React + Mapbox/Leaflet for interactive maps
- **Workflow:** Backend + Frontend run concurrently

npm install maplibre-gl
npm install leaflet react-leaflet

---

## 1. Prerequisites

- **Conda** (for Python environment)  
- **Node.js + npm** (for frontend)

---

## 2. Setup after Cloning

After cloning the repository, follow these steps.

### 2.1 Backend Setup
Go to backend folder:
```bash
cd backend
conda create -n weatherapp python=3.11 -y
conda activate weatherapp
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Run Python backend:
```bash
uvicorn main:app --reload --port 8000
```

The backend should now be running at http://localhost:8000

### 2.2 Frontend Setup
Go to frontend folder:
```bash
cd frontend
```

Install Node.js dependencies:
```bash
npm install
```

Run Python backend:
```bash
npm start
```
The frontend should now be running at http://localhost:3000

---

## 3 Run Both Backend & Frontend Concurrently
From the root folder of the project:

```bash
conda activate weatherapp
npm run dev
```

This will:
Start the backend at http://localhost:8000
Start the frontend at http://localhost:3000

Make sure the Conda environment weatherapp is active for the backend to work.

---

## 4. Notes
If the backend is already running, npm run dev will not start a second instance; make sure to close other servers if ports are busy.

The API endpoint /predict returns a mock prediction JSON; you can replace it with real ML predictions in backend/app/routes/predictions.py.

Make sure CORS is allowed in main.py so the frontend can fetch data:

```bash
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
