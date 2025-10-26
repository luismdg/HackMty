PROYECTO: SISTEMA DE GESTIÓN AEROPORTUARIA

DESCRIPCIÓN:
Sistema integral de gestión para aerolíneas que incluye control de vuelos, 
gestión de productos, análisis de productividad de empleados y asistente IA.

ESTRUCTURA DEL PROYECTO:
/
├── backend/          # API FastAPI
├── frontend/         # Aplicación React
├── data/            # Archivos CSV de datos
└── README.md

INSTALACIÓN Y EJECUCIÓN:

BACKEND (FastAPI):
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

FRONTEND (React):
cd frontend
npm install lucide-react
npm install @google/genai
npm start

EJECUCIÓN CONJUNTA:
npm run dev

DEPENDENCIAS PRINCIPALES:

Backend:
- FastAPI
- Uvicorn
- Pandas
- Python-multipart

Frontend:
- React
- Lucide React (iconos)
- @google/genai (Gemini AI)
- Tailwind CSS

CARACTERÍSTICAS PRINCIPALES:

1. GESTIÓN DE VUELOS:
   - Resumen y detalles de vuelos
   - Filtros por aerolínea, país y duración
   - Datos de pasajeros y rutas

2. GESTIÓN DE PRODUCTOS:
   - Control de inventario
   - Estado de frescura y expiración
   - Tasas de aceptación
   - Categorización por tipo

3. PRODUCTIVIDAD DE EMPLEADOS:
   - Métricas de rendimiento
   - Análisis por operador
   - Seguimiento de productividad

4. ASISTENTE IA:
   - Consultas inteligentes sobre datos
   - Integración con Google Gemini
   - Análisis de archivos CSV locales
   - Modo local sin conexión a IA

ARCHIVOS DE DATOS:
- flight_data.csv
- pastFlights_data.csv  
- products_data.csv
- products_data_augmented.csv
- productivity_data.csv

CONFIGURACIÓN OPCIONAL:
Para usar el asistente IA con Gemini, crear archivo .env en raíz:
REACT_APP_GEMINI_API_KEY=tu_api_key_de_gemini

PUERTOS:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

NOTAS:
- El sistema funciona completamente sin la API de Gemini
- Los datos se cargan desde archivos CSV locales
- Interfaz responsive y moderna
