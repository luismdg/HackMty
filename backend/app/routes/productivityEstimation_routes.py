from fastapi import APIRouter, HTTPException
import pandas as pd
import os
from typing import Dict, Any, List

router = APIRouter(prefix="/productivity", tags=["Productivity Estimation"])

def load_productivity_data_from_csv() -> Dict[str, Any]:
    """
    Carga los datos de productividad desde el archivo CSV
    """
    try:
        # DEBUG: Ver la estructura de directorios
        current_dir = os.path.dirname(os.path.abspath(__file__))
        print(f"=== PRODUCTIVITY DEBUG INFO ===")
        print(f"Directorio actual del script: {current_dir}")
        
        # Construir la ruta paso a paso (igual que en data_routes)
        app_dir = os.path.dirname(current_dir)  # Salir de routes a app
        backend_dir = os.path.dirname(app_dir)  # Salir de app a backend
        project_root = os.path.dirname(backend_dir)  # Salir de backend al root del proyecto
        data_dir = os.path.join(project_root, 'data')  # Entrar a data
        
        csv_path = os.path.join(data_dir, 'productivity_data.csv')
        csv_path = os.path.abspath(csv_path)  # Normalizar la ruta
        
        print(f"Ruta construida del CSV: {csv_path}")
        print(f"¿Existe el directorio data?: {os.path.exists(data_dir)}")
        print(f"¿Existe el archivo CSV?: {os.path.exists(csv_path)}")
        
        # Listar archivos en el directorio data si existe
        if os.path.exists(data_dir):
            print(f"Archivos en data/: {os.listdir(data_dir)}")
        print("=================================")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Archivo no encontrado: {csv_path}")
        
        # Leer el CSV
        df = pd.read_csv(csv_path)
        print(f"CSV leído correctamente. Filas: {len(df)}")
        print(f"Columnas: {df.columns.tolist()}")
        
        # Convertir a diccionario con la estructura esperada
        productivity_data = {}
        
        for _, row in df.iterrows():
            sesion_id = row['sesion_id']
            productivity_data[sesion_id] = {
                "nombre_operario": row['nombre_operario'],
                "puesto": row['puesto'],
                "turno": row['turno'],
                "area_trabajo": row['area_trabajo'],
                "fecha_inicio": row['fecha_inicio'],
                "fecha_fin": row['fecha_fin'],
                "duracion_sesion_seg": float(row['duracion_sesion_seg']),
                "duracion_sesion_min": float(row['duracion_sesion_min']),
                "conteo_total_items": int(row['conteo_total_items']),
                "tasa_items_por_minuto": float(row['tasa_items_por_minuto']),
                "eficiencia_operario": float(row['eficiencia_operario']),
                "fps_promedio": float(row['fps_promedio']),
                "frames_procesados": int(row['frames_procesados']),
                "fuente_video": row['fuente_video'],
                "camara_id": row['camara_id'],
                "ubicacion_camara": row['ubicacion_camara'],
                "estado_sesion": row['estado_sesion'],
                "errores_deteccion": int(row['errores_deteccion']),
                "precision_promedio": float(row['precision_promedio']),
                "brazo_dominante": row['brazo_dominante'],
                "uso_brazo_izquierdo": float(row['uso_brazo_izquierdo']),
                "uso_brazo_derecho": float(row['uso_brazo_derecho']),
                "movimientos_eficientes": float(row['movimientos_eficientes'])
            }
        
        print(f"Datos procesados. Sesiones: {list(productivity_data.keys())}")
        return productivity_data
        
    except FileNotFoundError as e:
        error_msg = f"Archivo CSV de productividad no encontrado: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except KeyError as e:
        error_msg = f"Columna faltante en CSV de productividad: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Error leyendo CSV de productividad: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

# Ruta para obtener todas las sesiones de productividad
@router.get("/")
def get_all_sessions():
    """
    Obtiene todas las sesiones de productividad
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        return productivity_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener una sesión específica por ID
@router.get("/{sesion_id}")
def get_session_details(sesion_id: str):
    """
    Obtiene los detalles de una sesión específica por ID
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        if sesion_id not in productivity_data:
            raise HTTPException(status_code=404, detail=f"Session {sesion_id} not found")
        
        return productivity_data[sesion_id]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener sesiones por operario
@router.get("/operario/{nombre_operario}")
def get_sessions_by_operator(nombre_operario: str):
    """
    Obtiene todas las sesiones de un operario específico
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        sessions_by_operator = {}
        for session_id, session_data in productivity_data.items():
            if session_data['nombre_operario'] == nombre_operario:
                sessions_by_operator[session_id] = session_data
        
        if not sessions_by_operator:
            raise HTTPException(status_code=404, detail=f"No sessions found for operator: {nombre_operario}")
        
        return sessions_by_operator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener estadísticas generales
@router.get("/estadisticas/generales")
def get_general_statistics():
    """
    Obtiene estadísticas generales de todas las sesiones
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        if not productivity_data:
            return {"message": "No hay datos disponibles"}
        
        # Calcular estadísticas
        total_sessions = len(productivity_data)
        total_items = sum(session['conteo_total_items'] for session in productivity_data.values())
        avg_efficiency = sum(session['eficiencia_operario'] for session in productivity_data.values()) / total_sessions
        avg_items_per_minute = sum(session['tasa_items_por_minuto'] for session in productivity_data.values()) / total_sessions
        
        # Encontrar operarios más eficientes
        operators = {}
        for session in productivity_data.values():
            operator = session['nombre_operario']
            if operator not in operators:
                operators[operator] = {
                    'total_sessions': 0,
                    'total_items': 0,
                    'avg_efficiency': 0,
                    'areas_trabajo': set()
                }
            
            operators[operator]['total_sessions'] += 1
            operators[operator]['total_items'] += session['conteo_total_items']
            operators[operator]['avg_efficiency'] += session['eficiencia_operario']
            operators[operator]['areas_trabajo'].add(session['area_trabajo'])
        
        # Calcular promedios por operario
        for operator in operators:
            operators[operator]['avg_efficiency'] /= operators[operator]['total_sessions']
            operators[operator]['areas_trabajo'] = list(operators[operator]['areas_trabajo'])
        
        # Ordenar operarios por eficiencia
        top_operators = sorted(
            [(op, data) for op, data in operators.items()],
            key=lambda x: x[1]['avg_efficiency'],
            reverse=True
        )[:5]  # Top 5 operarios
        
        return {
            "estadisticas_generales": {
                "total_sesiones": total_sessions,
                "total_items_recolectados": total_items,
                "eficiencia_promedio": round(avg_efficiency, 2),
                "tasa_items_promedio_por_minuto": round(avg_items_per_minute, 2),
                "precision_promedio_deteccion": round(sum(session['precision_promedio'] for session in productivity_data.values()) / total_sessions, 2)
            },
            "top_operarios": [
                {
                    "nombre": operator,
                    "eficiencia_promedio": round(data['avg_efficiency'], 2),
                    "total_sesiones": data['total_sessions'],
                    "total_items": data['total_items'],
                    "areas_trabajo": data['areas_trabajo']
                }
                for operator, data in top_operators
            ],
            "distribucion_turnos": {
                "matutino": len([s for s in productivity_data.values() if s['turno'] == 'Matutino']),
                "vespertino": len([s for s in productivity_data.values() if s['turno'] == 'Vespertino'])
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")