# 🌦️ Weather Prediction App

A full-stack weather prediction web application for Mexico, combining:

- **Backend:** Python + FastAPI
- **Frontend:** React + Mapbox / Leaflet for interactive weather maps
- **Workflow:** Backend + Frontend run concurrently

---

## 1. Prerequisites

You’ll need the following installed:

- **Conda** (for Python virtual environment)  
- **Node.js + npm** (for React frontend)

---

## 2. Project Setup After Cloning

After cloning the repository, follow these steps.

### 2.1 Backend Setup
Go to project folder:
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
uvicorn app.main:app --reload --port 8000
```

The backend should now be running at http://localhost:8000

### 2.2 Frontend Setup
Go to project folder:
```bash
cd frontend
npm install maplibre-gl leaflet react-leaflet
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

## 4. Running the Storm Scheduler (schedule.py)
The backend and scheduler are isolated processes — the FastAPI server runs the API, while the scheduler script periodically generates new storm data.
They coexist in the same repository for convenience but operate independently.

### 4.1 Run Once for Debugging
If you just want to execute the scheduler once (to debug or test):
```bash
cd backend
python -m app.services.schedule
```
It will run fully and exit after one cycle.

### 4.2 Run Periodically (in Loop)
You can use a small bash script to run schedule.py automatically at fixed intervals.

Make it executable:
```bash
chmod +x monitor.sh
```

Then run it anytime from the root directory:
```bash
./monitor.sh
```

### 4.3 Optional: Run as Background Service
If you want it to keep running even after closing the terminal:
```bash
nohup ./monitor.sh > monitor.log 2>&1 &
```
This will detach the process and write logs to monitor.log.

---

## 5. Notes
If npm run dev shows port conflicts, make sure no previous backend or frontend instances are running.

The backend’s /predict endpoint currently returns mock data — replace it with your ML logic in backend/app/routes/predictions.py.

Enable CORS in backend/app/main.py so the frontend can communicate with the API:

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
