from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import os
from typing import Dict, Any, List, Optional

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
                "movimientos_eficientes": float(row['movimientos_eficientes']),
                "country": row['country'],
                "ciudad": row['ciudad']
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

# Ruta para obtener sesiones por país
@router.get("/pais/{country}")
def get_sessions_by_country(country: str):
    """
    Obtiene todas las sesiones de un país específico
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        sessions_by_country = {}
        for session_id, session_data in productivity_data.items():
            if session_data['country'].lower() == country.lower():
                sessions_by_country[session_id] = session_data
        
        if not sessions_by_country:
            raise HTTPException(status_code=404, detail=f"No sessions found for country: {country}")
        
        return sessions_by_country
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener sesiones por ciudad
@router.get("/ciudad/{ciudad}")
def get_sessions_by_city(ciudad: str):
    """
    Obtiene todas las sesiones de una ciudad específica
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        sessions_by_city = {}
        for session_id, session_data in productivity_data.items():
            if session_data['ciudad'].lower() == ciudad.lower():
                sessions_by_city[session_id] = session_data
        
        if not sessions_by_city:
            raise HTTPException(status_code=404, detail=f"No sessions found for city: {ciudad}")
        
        return sessions_by_city
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
                    'areas_trabajo': set(),
                    'countries': set(),
                    'ciudades': set()
                }
            
            operators[operator]['total_sessions'] += 1
            operators[operator]['total_items'] += session['conteo_total_items']
            operators[operator]['avg_efficiency'] += session['eficiencia_operario']
            operators[operator]['areas_trabajo'].add(session['area_trabajo'])
            operators[operator]['countries'].add(session['country'])
            operators[operator]['ciudades'].add(session['ciudad'])
        
        # Calcular promedios por operario
        for operator in operators:
            operators[operator]['avg_efficiency'] /= operators[operator]['total_sessions']
            operators[operator]['areas_trabajo'] = list(operators[operator]['areas_trabajo'])
            operators[operator]['countries'] = list(operators[operator]['countries'])
            operators[operator]['ciudades'] = list(operators[operator]['ciudades'])
        
        # Ordenar operarios por eficiencia
        top_operators = sorted(
            [(op, data) for op, data in operators.items()],
            key=lambda x: x[1]['avg_efficiency'],
            reverse=True
        )[:5]  # Top 5 operarios
        
        # Estadísticas por país
        countries_stats = {}
        for session in productivity_data.values():
            country = session['country']
            if country not in countries_stats:
                countries_stats[country] = {
                    'total_sessions': 0,
                    'total_items': 0,
                    'avg_efficiency': 0,
                    'ciudades': set()
                }
            
            countries_stats[country]['total_sessions'] += 1
            countries_stats[country]['total_items'] += session['conteo_total_items']
            countries_stats[country]['avg_efficiency'] += session['eficiencia_operario']
            countries_stats[country]['ciudades'].add(session['ciudad'])
        
        # Calcular promedios por país
        for country in countries_stats:
            countries_stats[country]['avg_efficiency'] = round(
                countries_stats[country]['avg_efficiency'] / countries_stats[country]['total_sessions'], 
                2
            )
            countries_stats[country]['ciudades'] = list(countries_stats[country]['ciudades'])
        
        # Estadísticas por ciudad
        cities_stats = {}
        for session in productivity_data.values():
            ciudad = session['ciudad']
            if ciudad not in cities_stats:
                cities_stats[ciudad] = {
                    'total_sessions': 0,
                    'total_items': 0,
                    'avg_efficiency': 0,
                    'country': session['country']
                }
            
            cities_stats[ciudad]['total_sessions'] += 1
            cities_stats[ciudad]['total_items'] += session['conteo_total_items']
            cities_stats[ciudad]['avg_efficiency'] += session['eficiencia_operario']
        
        # Calcular promedios por ciudad
        for ciudad in cities_stats:
            cities_stats[ciudad]['avg_efficiency'] = round(
                cities_stats[ciudad]['avg_efficiency'] / cities_stats[ciudad]['total_sessions'], 
                2
            )
        
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
                    "areas_trabajo": data['areas_trabajo'],
                    "paises": data['countries'],
                    "ciudades": data['ciudades']
                }
                for operator, data in top_operators
            ],
            "distribucion_turnos": {
                "matutino": len([s for s in productivity_data.values() if s['turno'] == 'Matutino']),
                "vespertino": len([s for s in productivity_data.values() if s['turno'] == 'Vespertino'])
            },
            "estadisticas_por_pais": countries_stats,
            "estadisticas_por_ciudad": cities_stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener análisis geográfico
@router.get("/analisis/geografico")
def get_geographic_analysis():
    """
    Obtiene análisis de productividad por ubicación geográfica
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        if not productivity_data:
            return {"message": "No hay datos disponibles"}
        
        # Análisis por país
        paises_analisis = {}
        for session in productivity_data.values():
            pais = session['country']
            if pais not in paises_analisis:
                paises_analisis[pais] = {
                    'total_sesiones': 0,
                    'total_operarios': set(),
                    'total_items': 0,
                    'eficiencia_promedio': 0,
                    'tasa_items_promedio': 0,
                    'ciudades': set()
                }
            
            paises_analisis[pais]['total_sesiones'] += 1
            paises_analisis[pais]['total_operarios'].add(session['nombre_operario'])
            paises_analisis[pais]['total_items'] += session['conteo_total_items']
            paises_analisis[pais]['eficiencia_promedio'] += session['eficiencia_operario']
            paises_analisis[pais]['tasa_items_promedio'] += session['tasa_items_por_minuto']
            paises_analisis[pais]['ciudades'].add(session['ciudad'])
        
        # Calcular promedios y procesar datos
        for pais in paises_analisis:
            paises_analisis[pais]['total_operarios'] = len(paises_analisis[pais]['total_operarios'])
            paises_analisis[pais]['eficiencia_promedio'] = round(
                paises_analisis[pais]['eficiencia_promedio'] / paises_analisis[pais]['total_sesiones'], 
                2
            )
            paises_analisis[pais]['tasa_items_promedio'] = round(
                paises_analisis[pais]['tasa_items_promedio'] / paises_analisis[pais]['total_sesiones'], 
                2
            )
            paises_analisis[pais]['ciudades'] = list(paises_analisis[pais]['ciudades'])
        
        # Análisis por ciudad
        ciudades_analisis = {}
        for session in productivity_data.values():
            ciudad = session['ciudad']
            if ciudad not in ciudades_analisis:
                ciudades_analisis[ciudad] = {
                    'pais': session['country'],
                    'total_sesiones': 0,
                    'total_operarios': set(),
                    'total_items': 0,
                    'eficiencia_promedio': 0,
                    'tasa_items_promedio': 0
                }
            
            ciudades_analisis[ciudad]['total_sesiones'] += 1
            ciudades_analisis[ciudad]['total_operarios'].add(session['nombre_operario'])
            ciudades_analisis[ciudad]['total_items'] += session['conteo_total_items']
            ciudades_analisis[ciudad]['eficiencia_promedio'] += session['eficiencia_operario']
            ciudades_analisis[ciudad]['tasa_items_promedio'] += session['tasa_items_por_minuto']
        
        # Calcular promedios por ciudad
        for ciudad in ciudades_analisis:
            ciudades_analisis[ciudad]['total_operarios'] = len(ciudades_analisis[ciudad]['total_operarios'])
            ciudades_analisis[ciudad]['eficiencia_promedio'] = round(
                ciudades_analisis[ciudad]['eficiencia_promedio'] / ciudades_analisis[ciudad]['total_sesiones'], 
                2
            )
            ciudades_analisis[ciudad]['tasa_items_promedio'] = round(
                ciudades_analisis[ciudad]['tasa_items_promedio'] / ciudades_analisis[ciudad]['total_sesiones'], 
                2
            )
        
        # Encontrar mejor y peor desempeño por ubicación
        mejor_pais = max(paises_analisis.items(), key=lambda x: x[1]['eficiencia_promedio'])
        mejor_ciudad = max(ciudades_analisis.items(), key=lambda x: x[1]['eficiencia_promedio'])
        
        return {
            "analisis_por_pais": paises_analisis,
            "analisis_por_ciudad": ciudades_analisis,
            "mejor_desempeno": {
                "pais": {
                    "nombre": mejor_pais[0],
                    "eficiencia": mejor_pais[1]['eficiencia_promedio']
                },
                "ciudad": {
                    "nombre": mejor_ciudad[0],
                    "pais": mejor_ciudad[1]['pais'],
                    "eficiencia": mejor_ciudad[1]['eficiencia_promedio']
                }
            },
            "resumen_geografico": {
                "total_paises": len(paises_analisis),
                "total_ciudades": len(ciudades_analisis),
                "paises": list(paises_analisis.keys()),
                "ciudades": list(ciudades_analisis.keys())
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para filtrar sesiones con múltiples criterios
@router.get("/filtros/avanzados")
def get_filtered_sessions(
    pais: Optional[str] = Query(None, description="Filtrar por país"),
    ciudad: Optional[str] = Query(None, description="Filtrar por ciudad"),
    turno: Optional[str] = Query(None, description="Filtrar por turno"),
    eficiencia_min: Optional[float] = Query(None, description="Eficiencia mínima"),
    eficiencia_max: Optional[float] = Query(None, description="Eficiencia máxima")
):
    """
    Obtiene sesiones filtradas por múltiples criterios
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        filtered_sessions = {}
        for session_id, session_data in productivity_data.items():
            # Aplicar filtros
            if pais and session_data['country'].lower() != pais.lower():
                continue
            if ciudad and session_data['ciudad'].lower() != ciudad.lower():
                continue
            if turno and session_data['turno'].lower() != turno.lower():
                continue
            if eficiencia_min and session_data['eficiencia_operario'] < eficiencia_min:
                continue
            if eficiencia_max and session_data['eficiencia_operario'] > eficiencia_max:
                continue
            
            filtered_sessions[session_id] = session_data
        
        return {
            "filtros_aplicados": {
                "pais": pais,
                "ciudad": ciudad,
                "turno": turno,
                "eficiencia_min": eficiencia_min,
                "eficiencia_max": eficiencia_max
            },
            "total_resultados": len(filtered_sessions),
            "sesiones": filtered_sessions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
    
@router.get("/recomendacion/vuelo/{flight_id}")
def get_recommended_operator_for_flight(flight_id: str):
    """
    Recomienda los dos operarios más adecuados para un vuelo específico
    basado en la ubicación y características del vuelo
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        # Simular datos del vuelo (en una implementación real, obtendrías esto de la base de datos de vuelos)
        flight_location_map = {
            "CTL395": {"country": "USA", "ciudad": "New York"},
            "AA1234": {"country": "USA", "ciudad": "Chicago"},
            "DL7890": {"country": "USA", "ciudad": "Miami"},
            "UA4567": {"country": "USA", "ciudad": "Los Angeles"}
        }
        
        # Obtener ubicación del vuelo o usar valores por defecto
        flight_location = flight_location_map.get(flight_id, {"country": "USA", "ciudad": "New York"})
        
        # Filtrar operarios por ubicación del vuelo
        operators_in_location = {}
        for session_id, session_data in productivity_data.items():
            if (session_data['country'] == flight_location['country'] and 
                session_data['ciudad'] == flight_location['ciudad']):
                
                operator_name = session_data['nombre_operario']
                if operator_name not in operators_in_location:
                    operators_in_location[operator_name] = {
                        'total_sessions': 0,
                        'total_efficiency': 0,
                        'total_items_per_minute': 0,
                        'avg_precision': 0,
                        'puesto': session_data['puesto'],
                        'areas_trabajo': set(),
                        'sessions': []
                    }
                
                operators_in_location[operator_name]['total_sessions'] += 1
                operators_in_location[operator_name]['total_efficiency'] += session_data['eficiencia_operario']
                operators_in_location[operator_name]['total_items_per_minute'] += session_data['tasa_items_por_minuto']
                operators_in_location[operator_name]['avg_precision'] += session_data['precision_promedio']
                operators_in_location[operator_name]['areas_trabajo'].add(session_data['area_trabajo'])
                operators_in_location[operator_name]['sessions'].append({
                    'session_id': session_id,
                    'eficiencia': session_data['eficiencia_operario'],
                    'items_por_minuto': session_data['tasa_items_por_minuto'],
                    'precision': session_data['precision_promedio']
                })
        
        if not operators_in_location:
            # Si no hay operarios en esa ubicación, buscar en el país
            for session_id, session_data in productivity_data.items():
                if session_data['country'] == flight_location['country']:
                    
                    operator_name = session_data['nombre_operario']
                    if operator_name not in operators_in_location:
                        operators_in_location[operator_name] = {
                            'total_sessions': 0,
                            'total_efficiency': 0,
                            'total_items_per_minute': 0,
                            'avg_precision': 0,
                            'puesto': session_data['puesto'],
                            'areas_trabajo': set(),
                            'sessions': []
                        }
                    
                    operators_in_location[operator_name]['total_sessions'] += 1
                    operators_in_location[operator_name]['total_efficiency'] += session_data['eficiencia_operario']
                    operators_in_location[operator_name]['total_items_per_minute'] += session_data['tasa_items_por_minuto']
                    operators_in_location[operator_name]['avg_precision'] += session_data['precision_promedio']
                    operators_in_location[operator_name]['areas_trabajo'].add(session_data['area_trabajo'])
                    operators_in_location[operator_name]['sessions'].append({
                        'session_id': session_id,
                        'eficiencia': session_data['eficiencia_operario'],
                        'items_por_minuto': session_data['tasa_items_por_minuto'],
                        'precision': session_data['precision_promedio']
                    })
        
        if not operators_in_location:
            return {
                "flight_id": flight_id,
                "location": flight_location,
                "recommendation": "No se encontraron operarios para esta ubicación",
                "available_operators": []
            }
        
        # Calcular promedios y score para cada operario
        for operator in operators_in_location.values():
            operator['avg_efficiency'] = operator['total_efficiency'] / operator['total_sessions']
            operator['avg_items_per_minute'] = operator['total_items_per_minute'] / operator['total_sessions']
            operator['avg_precision'] = operator['avg_precision'] / operator['total_sessions']
            operator['areas_trabajo'] = list(operator['areas_trabajo'])
            
            # Calcular score combinado (eficiencia + tasa de items + precisión)
            operator['score'] = (
                operator['avg_efficiency'] * 0.5 +
                operator['avg_items_per_minute'] * 0.3 +
                operator['avg_precision'] * 0.2
            )
        
        # Ordenar operarios por score
        sorted_operators = sorted(
            [(name, data) for name, data in operators_in_location.items()],
            key=lambda x: x[1]['score'],
            reverse=True
        )
        
        # Obtener los dos mejores operarios
        top_operators = sorted_operators[:2] if len(sorted_operators) >= 2 else sorted_operators
        
        # Preparar respuesta con los dos operarios recomendados
        recommended_operators = []
        for operator_name, operator_data in top_operators:
            recommended_operators.append({
                "nombre": operator_name,
                "puesto": operator_data['puesto'],
                "score": round(operator_data['score'], 2),
                "eficiencia_promedio": round(operator_data['avg_efficiency'], 2),
                "items_por_minuto_promedio": round(operator_data['avg_items_per_minute'], 2),
                "precision_promedio": round(operator_data['avg_precision'], 2),
                "total_sesiones": operator_data['total_sessions'],
                "areas_trabajo": operator_data['areas_trabajo'],
                "ubicacion": f"{flight_location['ciudad']}, {flight_location['country']}"
            })
        
        return {
            "flight_id": flight_id,
            "location": flight_location,
            "recommended_operators": recommended_operators,
            "alternative_operators": [
                {
                    "nombre": op[0],
                    "puesto": op[1]['puesto'],
                    "score": round(op[1]['score'], 2),
                    "eficiencia_promedio": round(op[1]['avg_efficiency'], 2)
                }
                for op in sorted_operators[2:5]  # Siguientes 3 mejores como alternativas
            ] if len(sorted_operators) > 2 else []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
    
# Ruta para obtener todas las ciudades disponibles
@router.get("/ciudades/disponibles")
def get_available_cities():
    """
    Obtiene todas las ciudades disponibles en el sistema
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        cities = set()
        for session_data in productivity_data.values():
            cities.add(session_data['ciudad'])
        
        return {
            "total_ciudades": len(cities),
            "ciudades": sorted(list(cities))
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener operarios por ciudad
@router.get("/ciudad/{ciudad}/operarios")
def get_operators_by_city(ciudad: str):
    """
    Obtiene todos los operarios que trabajan en una ciudad específica
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        operators_in_city = {}
        for session_id, session_data in productivity_data.items():
            if session_data['ciudad'].lower() == ciudad.lower():
                operator_name = session_data['nombre_operario']
                if operator_name not in operators_in_city:
                    operators_in_city[operator_name] = {
                        'puesto': session_data['puesto'],
                        'total_sessions': 0,
                        'total_efficiency': 0,
                        'total_items': 0,
                        'avg_items_per_minute': 0,
                        'country': session_data['country'],
                        'ciudad': session_data['ciudad'],
                        'areas_trabajo': set(),
                        'turnos': set(),
                        'sessions': []
                    }
                
                operators_in_city[operator_name]['total_sessions'] += 1
                operators_in_city[operator_name]['total_efficiency'] += session_data['eficiencia_operario']
                operators_in_city[operator_name]['total_items'] += session_data['conteo_total_items']
                operators_in_city[operator_name]['avg_items_per_minute'] += session_data['tasa_items_por_minuto']
                operators_in_city[operator_name]['areas_trabajo'].add(session_data['area_trabajo'])
                operators_in_city[operator_name]['turnos'].add(session_data['turno'])
                operators_in_city[operator_name]['sessions'].append(session_id)
        
        if not operators_in_city:
            raise HTTPException(status_code=404, detail=f"No se encontraron operarios en la ciudad: {ciudad}")
        
        # Calcular promedios
        for operator in operators_in_city.values():
            operator['avg_efficiency'] = round(operator['total_efficiency'] / operator['total_sessions'], 2)
            operator['avg_items_per_minute'] = round(operator['avg_items_per_minute'] / operator['total_sessions'], 2)
            operator['areas_trabajo'] = list(operator['areas_trabajo'])
            operator['turnos'] = list(operator['turnos'])
        
        # Ordenar por eficiencia
        sorted_operators = sorted(
            [(name, data) for name, data in operators_in_city.items()],
            key=lambda x: x[1]['avg_efficiency'],
            reverse=True
        )
        
        return {
            "ciudad": ciudad,
            "total_operarios": len(operators_in_city),
            "operarios": [
                {
                    "nombre": name,
                    "puesto": data['puesto'],
                    "eficiencia_promedio": data['avg_efficiency'],
                    "items_por_minuto_promedio": data['avg_items_per_minute'],
                    "total_sesiones": data['total_sessions'],
                    "total_items": data['total_items'],
                    "areas_trabajo": data['areas_trabajo'],
                    "turnos": data['turnos'],
                    "pais": data['country']
                }
                for name, data in sorted_operators
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener estadísticas de una ciudad específica
@router.get("/ciudad/{ciudad}/estadisticas")
def get_city_statistics(ciudad: str):
    """
    Obtiene estadísticas detalladas de una ciudad específica
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        city_sessions = []
        total_efficiency = 0
        total_items_per_minute = 0
        total_items = 0
        operators = set()
        areas_trabajo = set()
        turnos = set()
        
        for session_id, session_data in productivity_data.items():
            if session_data['ciudad'].lower() == ciudad.lower():
                city_sessions.append(session_data)
                total_efficiency += session_data['eficiencia_operario']
                total_items_per_minute += session_data['tasa_items_por_minuto']
                total_items += session_data['conteo_total_items']
                operators.add(session_data['nombre_operario'])
                areas_trabajo.add(session_data['area_trabajo'])
                turnos.add(session_data['turno'])
        
        if not city_sessions:
            raise HTTPException(status_code=404, detail=f"No se encontraron sesiones en la ciudad: {ciudad}")
        
        total_sessions = len(city_sessions)
        avg_efficiency = round(total_efficiency / total_sessions, 2)
        avg_items_per_minute = round(total_items_per_minute / total_sessions, 2)
        
        # Encontrar el operario más eficiente de la ciudad
        best_operator = max(city_sessions, key=lambda x: x['eficiencia_operario'])
        
        # Distribución por turno
        turno_distribution = {}
        for session in city_sessions:
            turno = session['turno']
            if turno not in turno_distribution:
                turno_distribution[turno] = 0
            turno_distribution[turno] += 1
        
        return {
            "ciudad": ciudad,
            "pais": city_sessions[0]['country'] if city_sessions else "N/A",
            "estadisticas_generales": {
                "total_sesiones": total_sessions,
                "total_operarios": len(operators),
                "total_items_procesados": total_items,
                "eficiencia_promedio": avg_efficiency,
                "items_por_minuto_promedio": avg_items_per_minute,
                "precision_promedio": round(sum(s['precision_promedio'] for s in city_sessions) / total_sessions, 2)
            },
            "mejor_operario": {
                "nombre": best_operator['nombre_operario'],
                "puesto": best_operator['puesto'],
                "eficiencia": best_operator['eficiencia_operario'],
                "items_por_minuto": best_operator['tasa_items_por_minuto']
            },
            "distribucion_areas": list(areas_trabajo),
            "distribucion_turnos": turno_distribution,
            "operarios": list(operators)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para obtener información de ubicación de un operario específico
@router.get("/operario/{nombre_operario}/ubicacion")
def get_operator_location(nombre_operario: str):
    """
    Obtiene la información de ubicación de un operario específico
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        operator_sessions = []
        for session_data in productivity_data.values():
            if session_data['nombre_operario'] == nombre_operario:
                operator_sessions.append(session_data)
        
        if not operator_sessions:
            raise HTTPException(status_code=404, detail=f"No se encontraron sesiones para el operario: {nombre_operario}")
        
        # Obtener ubicación (debería ser consistente para el mismo operario)
        first_session = operator_sessions[0]
        ciudad = first_session['ciudad']
        pais = first_session['country']
        
        # Verificar consistencia de ubicación
        consistent_location = all(
            session['ciudad'] == ciudad and session['country'] == pais 
            for session in operator_sessions
        )
        
        # Calcular estadísticas en esa ubicación
        total_sessions = len(operator_sessions)
        avg_efficiency = sum(session['eficiencia_operario'] for session in operator_sessions) / total_sessions
        avg_items_per_minute = sum(session['tasa_items_por_minuto'] for session in operator_sessions) / total_sessions
        
        return {
            "operario": nombre_operario,
            "puesto": first_session['puesto'],
            "ubicacion": {
                "ciudad": ciudad,
                "pais": pais,
                "ubicacion_consistente": consistent_location
            },
            "estadisticas_ubicacion": {
                "total_sesiones": total_sessions,
                "eficiencia_promedio": round(avg_efficiency, 2),
                "items_por_minuto_promedio": round(avg_items_per_minute, 2),
                "areas_trabajo": list(set(session['area_trabajo'] for session in operator_sessions))
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Ruta para comparar ciudades
@router.get("/ciudades/comparacion")
def compare_cities(
    ciudades: str = Query(..., description="Ciudades a comparar, separadas por coma")
):
    """
    Compara el desempeño entre múltiples ciudades
    """
    try:
        productivity_data = load_productivity_data_from_csv()
        
        cities_to_compare = [ciudad.strip() for ciudad in ciudades.split(',')]
        comparison_data = {}
        
        for ciudad in cities_to_compare:
            city_sessions = [
                session_data for session_data in productivity_data.values()
                if session_data['ciudad'].lower() == ciudad.lower()
            ]
            
            if not city_sessions:
                comparison_data[ciudad] = {"error": "No se encontraron datos"}
                continue
            
            total_sessions = len(city_sessions)
            total_efficiency = sum(session['eficiencia_operario'] for session in city_sessions)
            total_items_per_minute = sum(session['tasa_items_por_minuto'] for session in city_sessions)
            total_items = sum(session['conteo_total_items'] for session in city_sessions)
            
            operators = set(session['nombre_operario'] for session in city_sessions)
            
            comparison_data[ciudad] = {
                "pais": city_sessions[0]['country'],
                "total_sesiones": total_sessions,
                "total_operarios": len(operators),
                "total_items_procesados": total_items,
                "eficiencia_promedio": round(total_efficiency / total_sessions, 2),
                "items_por_minuto_promedio": round(total_items_per_minute / total_sessions, 2),
                "precision_promedio": round(sum(session['precision_promedio'] for session in city_sessions) / total_sessions, 2),
                "operarios": list(operators)
            }
        
        # Encontrar la ciudad con mejor eficiencia
        valid_cities = {k: v for k, v in comparison_data.items() if 'error' not in v}
        if valid_cities:
            best_city = max(valid_cities.items(), key=lambda x: x[1]['eficiencia_promedio'])
            worst_city = min(valid_cities.items(), key=lambda x: x[1]['eficiencia_promedio'])
        else:
            best_city = worst_city = (None, None)
        
        return {
            "ciudades_comparadas": cities_to_compare,
            "comparacion": comparison_data,
            "resumen": {
                "mejor_desempeno": {
                    "ciudad": best_city[0],
                    "eficiencia": best_city[1]['eficiencia_promedio'] if best_city[0] else None
                },
                "peor_desempeno": {
                    "ciudad": worst_city[0],
                    "eficiencia": worst_city[1]['eficiencia_promedio'] if worst_city[0] else None
                },
                "diferencia_eficiencia": round(best_city[1]['eficiencia_promedio'] - worst_city[1]['eficiencia_promedio'], 2) 
                if best_city[0] and worst_city[0] else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")