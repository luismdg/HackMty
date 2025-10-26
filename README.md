# FlightFlow

*Smart Intelligence for Airline Catering*

FlightFlow is an intelligent platform that combines data analytics and computer vision to optimize airline catering operations. Built for efficiency and precision, it empowers catering teams to make data-driven decisions across flights, products, and workforce management.

---

## Overview

With over 700 million passengers served yearly, airline catering demands flawless coordination. FlightFlow addresses this challenge by leveraging machine learning and real-time computer vision to streamline operations across three core dimensions:

### 1. Flights
Visualize upcoming flights with comprehensive operational details and KPIs for accurate planning. Track passenger capacity, flight duration, routes, and service requirements in real-time.

### 2. Products
- *Consumption Prediction*: Random Forest regression model predicts food consumption based on flight type, duration, and passenger count
- *Inventory Management*: Track product freshness, acceptance rates, and categorization
- *Expiration Monitoring*: Identify items approaching expiration to minimize waste

### 3. Employees
- *Computer Vision Analytics*: YOLO-based real-time detection and tracking of tray assembly productivity
- *Performance Metrics*: Measure task completion speed and operational efficiency
- *Smart Assignment*: Deploy best-performing staff to high-priority flights based on data-driven insights

$$
\text{Data + Vision + KPIs} \Rightarrow \text{Operational Intelligence}
$$

---

## Technology Stack

### Backend
- *FastAPI* - High-performance API framework
- *Python* - Core programming language
- *Pandas* - Data manipulation and analysis
- *Scikit-learn* - Machine learning (RandomForestRegressor)
- *YOLO* - Real-time object detection for productivity tracking
- *Uvicorn* - ASGI server

### Frontend
- *React* - User interface framework
- *Tailwind CSS* - Modern, responsive design system
- *Lucide React* - Icon library
- *Google Gemini AI* - Optional AI-powered chatbot assistant

---

## Project Structure

```
FlightFlow/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── main.py       # Application entry point
│   │   ├── routes/       # API endpoints
│   │   └── models/       # ML models and utilities
├── frontend/             # React application
│   ├── src/
│   │   ├── screens/      # Main application views
│   │   └── components/   # Reusable UI components
├── data/                 # CSV datasets
│   ├── flight_data.csv
│   ├── products_data.csv
│   └── productivity_data.csv
└── README.md
```

---

## Installation

### Prerequisites
- *Node.js* (v14+)
- *Python* (v3.8+)
- *npm* or *yarn*

### Backend Setup

bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000


### Frontend Setup

bash
cd frontend
npm install
npm install lucide-react @google/genai
npm start


### Full Stack Execution

bash
npm run dev


---

## Usage

Once running, access the platform:

- *Frontend*: http://localhost:3000
- *Backend API*: http://localhost:8000
- *API Documentation*: http://localhost:8000/docs

### Key Features

*Flight Management*
- Summary and detailed flight views
- Filters by airline, country, and duration
- Passenger and route data visualization

*Product Management*
- Real-time inventory control
- Freshness and expiration status tracking
- Acceptance rate analytics
- Product categorization

*Productivity Analytics*
- Employee performance metrics
- Operator-level analysis
- Productivity tracking and visualization

*AI Assistant*
- Intelligent queries on operational data
- Google Gemini integration (optional)
- Local CSV data analysis
- Offline mode support

---

## Machine Learning Models

### Consumption Predictor
- *Algorithm*: Random Forest Regression
- *Features*: standard_quantity, units_returned
- *Outputs*: suggested_units, overload_units
- *Training*: Automatic on startup or manual via /prediction/train-model endpoint

### Computer Vision System
- *Framework*: YOLO (You Only Look Once)
- *Application*: Employee tray assembly tracking
- *Metrics*: Task completion speed, productivity rates

---

## Configuration

### Optional AI Features
Create a .env file in the root directory:


REACT_APP_GEMINI_API_KEY=your_gemini_api_key


Note: The system functions completely without the Gemini API

---

## Challenges & Learnings

During development, we encountered challenges with data format and volume for model training. This pushed us to develop more robust data preprocessing pipelines and synthetic data generation strategies.

We learned to identify overlooked operational gaps where manual processes persist—revealing significant opportunities for innovation and automation.

---

## What's Next

FlightFlow is highly scalable with potential for:
- Training on larger, production-scale datasets
- Extending computer vision to additional warehouse processes
- Enhanced AI chatbot with more direct administrator interactions
- Integration with real-time flight tracking systems
- Mobile application for on-the-ground operations

---

## Acknowledgments

Special thanks to *gategroup* for their support and collaboration in making this project possible.

---

*Developed by FlightFlow*
```
