from fastapi import APIRouter, HTTPException
import pandas as pd
import os
from typing import Dict, Any

router = APIRouter(prefix="/data", tags=["Flight Data"])

def load_flight_data_from_csv() -> Dict[str, Any]:
    """
    Carga los datos de vuelos desde un archivo CSV
    """
    try:
        # DEBUG: Ver la estructura de directorios
        current_dir = os.path.dirname(os.path.abspath(__file__))
        print(f"=== DEBUG INFO ===")
        print(f"Directorio actual del script: {current_dir}")
        
        # Construir la ruta paso a paso
        app_dir = os.path.dirname(current_dir)  # Salir de routes a app
        backend_dir = os.path.dirname(app_dir)  # Salir de app a backend
        project_root = os.path.dirname(backend_dir)  # Salir de backend al root del proyecto
        data_dir = os.path.join(project_root, 'data')  # Entrar a data
        
        csv_path = os.path.join(data_dir, 'flight_data.csv')
        csv_path = os.path.abspath(csv_path)  # Normalizar la ruta
        
        print(f"Ruta construida del CSV: {csv_path}")
        print(f"¿Existe el directorio data?: {os.path.exists(data_dir)}")
        print(f"¿Existe el archivo CSV?: {os.path.exists(csv_path)}")
        
        # Listar archivos en el directorio data si existe
        if os.path.exists(data_dir):
            print(f"Archivos en data/: {os.listdir(data_dir)}")
        print("==================")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Archivo no encontrado: {csv_path}")
        
        # Leer el CSV
        df = pd.read_csv(csv_path)
        print(f"CSV leído correctamente. Filas: {len(df)}")
        print(f"Columnas: {df.columns.tolist()}")
        
        # Convertir a diccionario con la estructura esperada
        flight_data = {}
        
        for _, row in df.iterrows():
            flight_id = row['flight_id']
            flight_data[flight_id] = {
                "airline": row['airline'],
                "airlineIcon": row['airline_icon'],
                "aircraft": row['aircraft'],
                "maxCapacity": int(row['max_capacity']),
                "ticketsSold": int(row['tickets_sold']),
                "duration": float(row['duration']),
                "origin": row['origin'],
                "destination": row['destination'],
                "departureDate": row['departure_date'],
                "departureTime": row['departure_time'],
            }
        
        print(f"Datos procesados. Vuelos: {list(flight_data.keys())}")
        return flight_data
        
    except FileNotFoundError as e:
        error_msg = f"Archivo CSV no encontrado: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except KeyError as e:
        error_msg = f"Columna faltante en CSV: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Error leyendo CSV: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

# Ruta para obtener todos los vuelos
@router.get("/")
def get_all_flights():
    try:
        flight_data = load_flight_data_from_csv()
        return flight_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener un vuelo específico por ID
@router.get("/{flight_id}")
def get_flight_details(flight_id: str):
    try:
        flight_data = load_flight_data_from_csv()
        
        if flight_id not in flight_data:
            raise HTTPException(status_code=404, detail=f"Flight {flight_id} not found")
        
        return flight_data[flight_id]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")