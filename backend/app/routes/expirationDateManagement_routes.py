# expirationDateManagement_routes.py
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

router = APIRouter(prefix="/expiration", tags=["Expiration Date Management"])

# Variables globales para el modelo
freshness_model = None
label_encoders = {}
model_trained = False

def load_products_data() -> pd.DataFrame:
    """
    Carga los datos de productos desde el archivo CSV
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)  # Salir de routes a app
        backend_dir = os.path.dirname(app_dir)  # Salir de app a backend
        project_root = os.path.dirname(backend_dir)  # Salir de backend al root del proyecto
        data_dir = os.path.join(project_root, 'data')  # Entrar a data
        
        csv_path = os.path.join(data_dir, 'products_data_augmented.csv')
        csv_path = os.path.abspath(csv_path)
        
        print(f"Buscando archivo de datos de productos en: {csv_path}")
        print(f"¿Existe el archivo?: {os.path.exists(csv_path)}")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Archivo no encontrado: {csv_path}")
        
        # Leer el CSV
        df = pd.read_csv(csv_path)
        print(f"CSV de productos leído correctamente. Filas: {len(df)}")
        print(f"Columnas: {df.columns.tolist()}")
        
        return df
        
    except Exception as e:
        error_msg = f"Error leyendo CSV de productos: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

def calculate_freshness_score(row) -> Dict[str, Any]:
    """
    Calcula el freshness score basado en días restantes antes de la expiración
    """
    vida_util_dias = row['vida_util_dias']
    
    # Simular días transcurridos basado en el batch number y freshness_score existente
    # Si ya existe freshness_score, lo usamos como base
    if 'freshness_score' in row and not pd.isna(row['freshness_score']):
        existing_score = row['freshness_score']
        # Calcular días transcurridos basado en el score existente
        dias_transcurridos = vida_util_dias * (1 - existing_score / 100)
    else:
        # Si no existe, calcular basado en características del producto
        dias_transcurridos = vida_util_dias * np.random.uniform(0.1, 0.8)
    
    # Calcular días restantes
    dias_restantes = max(0, vida_util_dias - dias_transcurridos)
    
    # Calcular freshness score (0-100)
    freshness_score = (dias_restantes / vida_util_dias) * 100 if vida_util_dias > 0 else 0
    freshness_score = min(100, max(0, freshness_score))
    
    # Determinar estado de frescura
    if freshness_score >= 80:
        estado_frescura = "ÓPTIMO"
        color_estado = "green"
        riesgo = "bajo"
    elif freshness_score >= 60:
        estado_frescura = "ATENCIÓN"
        color_estado = "yellow"
        riesgo = "medio"
    elif freshness_score >= 40:
        estado_frescura = "CRÍTICO"
        color_estado = "orange"
        riesgo = "alto"
    else:
        estado_frescura = "EXPIRADO"
        color_estado = "red"
        riesgo = "muy_alto"
    
    # Recomendación de tipo de vuelo basado en frescura
    if freshness_score >= 75:
        recomendacion_vuelo = "Largos y Cortos"
        prioridad_uso = "alta"
    elif freshness_score >= 50:
        recomendacion_vuelo = "Cortos"
        prioridad_uso = "media"
    else:
        recomendacion_vuelo = "Urgente - Consumo Inmediato"
        prioridad_uso = "crítica"
    
    return {
        "freshness_score": round(freshness_score, 1),
        "dias_restantes": round(dias_restantes, 1),
        "dias_transcurridos": round(dias_transcurridos, 1),
        "estado_frescura": estado_frescura,
        "color_estado": color_estado,
        "nivel_riesgo": riesgo,
        "recomendacion_vuelo": recomendacion_vuelo,
        "prioridad_uso": prioridad_uso,
        "fecha_estimada_expiracion": (datetime.now() + timedelta(days=dias_restantes)).strftime("%Y-%m-%d")
    }

def train_freshness_model():
    """
    Entrena el modelo de predicción de frescura
    """
    global freshness_model, label_encoders, model_trained
    
    try:
        print("Iniciando entrenamiento del modelo de frescura...")
        df = load_products_data()
        
        # Calcular freshness scores para todos los productos
        freshness_data = []
        for _, row in df.iterrows():
            freshness_info = calculate_freshness_score(row)
            freshness_data.append(freshness_info)
        
        # Combinar datos originales con información de frescura
        df_freshness = df.copy()
        freshness_df = pd.DataFrame(freshness_data)
        df_combined = pd.concat([df_freshness, freshness_df], axis=1)
        
        # Preparar datos para el modelo
        features = ['unit_cost', 'vida_util_dias', 'precio_consumidor', 'standard_quantity', 
                   'units_returned', 'units_consumed', 'suggested_units', 'overload_units']
        
        # Codificar variables categóricas
        categorical_features = ['tipo_servicio', 'aerolinea', 'tipo', 'Category', 'Supplier', 
                               'Storage_Temperature', 'Quality_Status', 'Storage_Location', 'Stock_Status']
        
        X = df_combined[features].copy()
        
        # Codificar características categóricas
        for feature in categorical_features:
            if feature in df_combined.columns:
                le = LabelEncoder()
                X[feature] = le.fit_transform(df_combined[feature].astype(str))
                label_encoders[feature] = le
        
        # Target: nivel de riesgo (clasificación multiclase)
        y = df_combined['nivel_riesgo']
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Entrenar modelo
        freshness_model = RandomForestClassifier(n_estimators=100, random_state=42)
        freshness_model.fit(X_train, y_train)
        
        # Evaluar modelo
        accuracy = freshness_model.score(X_test, y_test)
        
        print("Modelo de frescura entrenado exitosamente:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Clases: {freshness_model.classes_}")
        
        model_trained = True
        
        return {
            "status": "success",
            "message": "Modelo de frescura entrenado exitosamente",
            "metrics": {
                "accuracy": round(accuracy, 4),
                "training_samples": len(X_train),
                "test_samples": len(X_test),
                "feature_importance": dict(zip(features + categorical_features, 
                                             freshness_model.feature_importances_))
            }
        }
        
    except Exception as e:
        error_msg = f"Error entrenando el modelo de frescura: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.on_event("startup")
async def startup_event():
    """
    Entrena el modelo automáticamente al iniciar la aplicación
    """
    try:
        print("Iniciando entrenamiento del modelo de frescura al startup...")
        train_freshness_model()
    except Exception as e:
        print(f"Error durante startup del modelo de frescura: {e}")

@router.get("/")
def test_expiration():
    return {"message": "Ruta Expiration Date Management funcionando correctamente"}

@router.get("/train-model")
def train_model():
    """
    Endpoint para entrenar el modelo manualmente
    """
    try:
        result = train_freshness_model()
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/all-products")
def get_all_products_with_freshness():
    """
    Obtiene todos los productos con información de frescura calculada
    """
    try:
        df = load_products_data()
        
        products_with_freshness = []
        for _, row in df.iterrows():
            product_data = row.to_dict()
            freshness_info = calculate_freshness_score(row)
            
            # Combinar datos del producto con información de frescura
            combined_data = {**product_data, **freshness_info}
            products_with_freshness.append(combined_data)
        
        # Estadísticas generales
        freshness_scores = [p['freshness_score'] for p in products_with_freshness]
        estados_count = {}
        recomendaciones_count = {}
        
        for product in products_with_freshness:
            estado = product['estado_frescura']
            recomendacion = product['recomendacion_vuelo']
            
            estados_count[estado] = estados_count.get(estado, 0) + 1
            recomendaciones_count[recomendacion] = recomendaciones_count.get(recomendacion, 0) + 1
        
        return {
            "total_products": len(products_with_freshness),
            "freshness_statistics": {
                "avg_freshness_score": round(np.mean(freshness_scores), 2),
                "min_freshness_score": round(min(freshness_scores), 2),
                "max_freshness_score": round(max(freshness_scores), 2),
                "estados_distribution": estados_count,
                "recomendaciones_distribution": recomendaciones_count
            },
            "products": products_with_freshness
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/product/{product_id}")
def get_product_freshness_details(product_id: str):
    """
    Obtiene detalles de frescura de un producto específico
    """
    try:
        df = load_products_data()
        
        # Buscar producto por ID (asumiendo que product_id es único)
        product_row = df[df.index.astype(str) == product_id]
        if product_row.empty:
            raise HTTPException(status_code=404, detail=f"Producto {product_id} no encontrado")
        
        product_data = product_row.iloc[0].to_dict()
        freshness_info = calculate_freshness_score(product_row.iloc[0])
        
        combined_data = {**product_data, **freshness_info}
        
        return combined_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/alerts/freshness")
def get_freshness_alerts(
    min_score: float = Query(60, description="Score mínimo para alertas"),
    max_score: float = Query(100, description="Score máximo para alertas"),
    estado: Optional[str] = Query(None, description="Filtrar por estado de frescura"),
    tipo_vuelo: Optional[str] = Query(None, description="Filtrar por tipo de vuelo recomendado")
):
    """
    Obtiene alertas de productos con frescura baja
    """
    try:
        df = load_products_data()
        
        alert_products = []
        for _, row in df.iterrows():
            freshness_info = calculate_freshness_score(row)
            
            # Filtrar por score de frescura
            if min_score <= freshness_info['freshness_score'] <= max_score:
                product_data = row.to_dict()
                combined_data = {**product_data, **freshness_info}
                
                # Aplicar filtros adicionales
                if estado and freshness_info['estado_frescura'] != estado:
                    continue
                if tipo_vuelo and freshness_info['recomendacion_vuelo'] != tipo_vuelo:
                    continue
                
                alert_products.append(combined_data)
        
        # Ordenar por freshness score (menor a mayor)
        alert_products.sort(key=lambda x: x['freshness_score'])
        
        return {
            "filters_applied": {
                "min_score": min_score,
                "max_score": max_score,
                "estado": estado,
                "tipo_vuelo": tipo_vuelo
            },
            "total_alerts": len(alert_products),
            "alerts": alert_products
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/analysis/category")
def get_freshness_analysis_by_category():
    """
    Análisis de frescura por categoría de producto
    """
    try:
        df = load_products_data()
        
        categories = {}
        for _, row in df.iterrows():
            categoria = row.get('Category', 'Sin categoría')
            if categoria not in categories:
                categories[categoria] = {
                    'total_products': 0,
                    'avg_freshness_score': 0,
                    'products_optimal': 0,
                    'products_attention': 0,
                    'products_critical': 0,
                    'products_expired': 0,
                    'products': []
                }
            
            freshness_info = calculate_freshness_score(row)
            product_data = row.to_dict()
            combined_data = {**product_data, **freshness_info}
            
            categories[categoria]['total_products'] += 1
            categories[categoria]['avg_freshness_score'] += freshness_info['freshness_score']
            categories[categoria]['products'].append(combined_data)
            
            # Contar productos por estado
            estado = freshness_info['estado_frescura']
            if estado == "ÓPTIMO":
                categories[categoria]['products_optimal'] += 1
            elif estado == "ATENCIÓN":
                categories[categoria]['products_attention'] += 1
            elif estado == "CRÍTICO":
                categories[categoria]['products_critical'] += 1
            elif estado == "EXPIRADO":
                categories[categoria]['products_expired'] += 1
        
        # Calcular promedios
        for categoria in categories:
            categories[categoria]['avg_freshness_score'] = round(
                categories[categoria]['avg_freshness_score'] / categories[categoria]['total_products'], 
                2
            )
        
        return {
            "analysis_by_category": categories,
            "summary": {
                "total_categories": len(categories),
                "best_category": max(categories.items(), key=lambda x: x[1]['avg_freshness_score'])[0],
                "worst_category": min(categories.items(), key=lambda x: x[1]['avg_freshness_score'])[0],
                "total_optimal": sum(cat['products_optimal'] for cat in categories.values()),
                "total_critical": sum(cat['products_critical'] for cat in categories.values())
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/recommendations/flight-type")
def get_flight_type_recommendations():
    """
    Recomendaciones de productos por tipo de vuelo basado en frescura
    """
    try:
        df = load_products_data()
        
        flight_recommendations = {
            "vuelos_largos": [],
            "vuelos_cortos": [],
            "consumo_inmediato": []
        }
        
        for _, row in df.iterrows():
            freshness_info = calculate_freshness_score(row)
            product_data = row.to_dict()
            combined_data = {**product_data, **freshness_info}
            
            recomendacion = freshness_info['recomendacion_vuelo']
            
            if "Largos" in recomendacion:
                flight_recommendations["vuelos_largos"].append(combined_data)
            elif "Cortos" in recomendacion:
                flight_recommendations["vuelos_cortos"].append(combined_data)
            elif "Urgente" in recomendacion:
                flight_recommendations["consumo_inmediato"].append(combined_data)
        
        # Ordenar por prioridad
        for key in flight_recommendations:
            flight_recommendations[key].sort(key=lambda x: x['freshness_score'], reverse=True)
        
        return {
            "flight_recommendations": flight_recommendations,
            "summary": {
                "total_largos": len(flight_recommendations["vuelos_largos"]),
                "total_cortos": len(flight_recommendations["vuelos_cortos"]),
                "total_urgente": len(flight_recommendations["consumo_inmediato"])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/predict-freshness")
def predict_freshness(
    unit_cost: float = Query(..., description="Costo unitario"),
    vida_util_dias: int = Query(..., description="Vida útil en días"),
    precio_consumidor: float = Query(..., description="Precio al consumidor"),
    standard_quantity: int = Query(..., description="Cantidad estándar"),
    units_returned: int = Query(..., description="Unidades devueltas"),
    units_consumed: int = Query(..., description="Unidades consumidas"),
    tipo: str = Query(..., description="Tipo de producto"),
    aerolinea: str = Query(..., description="Aerolínea")
):
    """
    Predice el nivel de frescura para un nuevo producto
    """
    global freshness_model, model_trained
    
    try:
        if not model_trained or freshness_model is None:
            raise HTTPException(status_code=503, detail="Modelo no entrenado. Por favor, espere o entrene el modelo primero.")
        
        # Preparar datos para predicción
        input_data = {
            'unit_cost': unit_cost,
            'vida_util_dias': vida_util_dias,
            'precio_consumidor': precio_consumidor,
            'standard_quantity': standard_quantity,
            'units_returned': units_returned,
            'units_consumed': units_consumed,
            'tipo': tipo,
            'aerolinea': aerolinea
        }
        
        # Calcular freshness score manualmente (como fallback)
        simulated_row = {
            'vida_util_dias': vida_util_dias,
            'freshness_score': None
        }
        freshness_info = calculate_freshness_score(simulated_row)
        
        # Aquí podrías agregar la predicción del modelo si tienes más características
        # prediction = freshness_model.predict([feature_vector])
        
        return {
            "prediction": {
                "freshness_score": freshness_info['freshness_score'],
                "dias_restantes": freshness_info['dias_restantes'],
                "estado_frescura": freshness_info['estado_frescura'],
                "recomendacion_vuelo": freshness_info['recomendacion_vuelo'],
                "nivel_riesgo": freshness_info['nivel_riesgo']
            },
            "input_parameters": input_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la predicción: {str(e)}")

@router.get("/dashboard/stats")
def get_freshness_dashboard_stats():
    """
    Estadísticas para el dashboard de gestión de frescura
    """
    try:
        df = load_products_data()
        
        total_products = len(df)
        total_categories = len(set(df.get('Category', [])))
        total_airlines = len(set(df.get('aerolinea', [])))
        
        # Calcular estadísticas de frescura
        freshness_scores = []
        estados_count = {'ÓPTIMO': 0, 'ATENCIÓN': 0, 'CRÍTICO': 0, 'EXPIRADO': 0}
        recomendaciones_count = {}
        
        for _, row in df.iterrows():
            freshness_info = calculate_freshness_score(row)
            freshness_scores.append(freshness_info['freshness_score'])
            estado = freshness_info['estado_frescura']
            recomendacion = freshness_info['recomendacion_vuelo']
            
            estados_count[estado] += 1
            recomendaciones_count[recomendacion] = recomendaciones_count.get(recomendacion, 0) + 1
        
        avg_freshness = round(np.mean(freshness_scores), 2) if freshness_scores else 0
        
        # Productos que requieren atención inmediata
        immediate_attention = estados_count['CRÍTICO'] + estados_count['EXPIRADO']
        
        return {
            "overview": {
                "total_products": total_products,
                "total_categories": total_categories,
                "total_airlines": total_airlines,
                "avg_freshness_score": avg_freshness
            },
            "freshness_distribution": estados_count,
            "flight_recommendations": recomendaciones_count,
            "alerts": {
                "immediate_attention": immediate_attention,
                "attention_required": estados_count['ATENCIÓN'],
                "stable": estados_count['ÓPTIMO']
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")