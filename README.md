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

## 4. Running the 'Storm Downloader' (schedule.py)
The backend and 'Storm Downloader' are isolated processes. The FastAPI server runs the API, while the 'Storm Downloader' script periodically downloads new storm data.
They coexist in the same repository for convenience but operate independently.

### 4.1 Prerequisites
Before running the script, make sure these dependencies are installed.
They’re not automatically included in "requirements.txt" because of geospatial libraries.

If using Conda (recommended for Windows):
```bash
conda activate weatherapp
conda install -c conda-forge cartopy shapely xarray netcdf4 numpy pandas matplotlib scipy -y
```

If using Python / pip only (not Conda)::
```bash
pip install shapely xarray netcdf4 numpy pandas matplotlib scipy
pip install tropycal
```
⚠️ cartopy can be difficult to build with pip on Windows.
If it fails, use Conda instead — Conda handles compiled geospatial libraries automatically.

### 4.2 Run Once (Debug or Manual Execution)
Run a single data-fetch cycle manually:
Using Conda:
```bash
conda activate weatherapp
cd backend
python -m app.services.schedule
```
Using Python only:
```bash
cd backend
python -m app.services.schedule
```
This will:
- Fetch the latest tropical storm data for Mexico.
- Process and store it locally (depending on your backend setup).
- Exit after completing one full cycle.

### 4.3 Run Periodically (Automatic Loop)
To automate downloads at fixed intervals, you can use the included monitor.sh script.

Make it executable (only once):
```bash
chmod +x monitor.sh
```

Then start it from the project root:
```bash
./monitor.sh
```
It will repeatedly call schedule.py every few minutes, depending on your configured delay.

### 4.4 Optional: Run in Background
If you want the process to keep running even after closing the terminal:
```bash
nohup ./monitor.sh > monitor.log 2>&1 &
```
This will:
- Detach the process from your session.
- Redirect all output logs to monitor.log.

---

## 5. Notes
If npm run dev shows port conflicts, make sure no previous backend or frontend instances are running.

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
