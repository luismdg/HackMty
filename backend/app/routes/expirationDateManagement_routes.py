from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from typing import List, Optional, Dict, Any
import joblib
import os

router = APIRouter(prefix="/expiration", tags=["Expiration Date Management"])

# Cargar datos y modelo
try:
    products_df = pd.read_csv('products_data_complete.csv')
    # Asegurarse de que 'main_meal' esté consistentemente escrito
    products_df['tipo'] = products_df['tipo'].replace({'main meal': 'main_meal'})
except FileNotFoundError:
    # Crear datos de ejemplo si el archivo no existe
    products_df = pd.DataFrame()

try:
    model_artifacts = joblib.load('consumption_model_corregido.pkl')
    model = model_artifacts['model']
    scaler = model_artifacts['scaler']
    label_encoders = model_artifacts['label_encoders']
except:
    model_artifacts = None

@router.get("/")
def test_expiration():
    return {"message": "Ruta Expiration Date Management funcionando correctamente"}

@router.get("/products")
def get_all_products():
    """Obtener todos los productos con información de expiración"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    products = products_df.to_dict('records')
    return {
        "total_products": len(products),
        "products": products
    }

@router.get("/products/{product_id}")
def get_product_by_id(product_id: str):
    """Obtener un producto específico por ID"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    product = products_df[products_df['product_id'] == product_id]
    if product.empty:
        raise HTTPException(status_code=404, detail=f"Producto {product_id} no encontrado")
    
    return product.iloc[0].to_dict()

@router.get("/products/airline/{airline}")
def get_products_by_airline(airline: str):
    """Obtener productos por aerolínea"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    airline_products = products_df[products_df['aerolinea'] == airline]
    if airline_products.empty:
        raise HTTPException(status_code=404, detail=f"No se encontraron productos para {airline}")
    
    products = airline_products.to_dict('records')
    return {
        "airline": airline,
        "total_products": len(products),
        "products": products
    }

@router.get("/products/category/{category}")
def get_products_by_category(category: str):
    """Obtener productos por categoría"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    category_products = products_df[products_df['tipo'] == category]
    if category_products.empty:
        raise HTTPException(status_code=404, detail=f"No se encontraron productos en categoría {category}")
    
    products = category_products.to_dict('records')
    return {
        "category": category,
        "total_products": len(products),
        "products": products
    }

@router.get("/expiration-alerts")
def get_expiration_alerts(
    threshold: int = Query(30, description="Días restantes para alerta"),
    category: Optional[str] = Query(None, description="Filtrar por categoría")
):
    """Obtener alertas de productos próximos a expirar"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    # Calcular días restantes basado en freshness_score
    products_df['dias_restantes'] = (products_df['freshness_score'] / 100) * products_df['vida_util_dias']
    products_df['dias_restantes'] = products_df['dias_restantes'].round().astype(int)
    
    # Filtrar productos próximos a expirar
    alert_products = products_df[products_df['dias_restantes'] <= threshold]
    
    if category:
        alert_products = alert_products[alert_products['tipo'] == category]
    
    # Ordenar por días restantes (menor a mayor)
    alert_products = alert_products.sort_values('dias_restantes')
    
    products = alert_products.to_dict('records')
    
    return {
        "threshold_days": threshold,
        "total_alerts": len(products),
        "alerts": products
    }

@router.get("/freshness-analysis")
def get_freshness_analysis():
    """Análisis de frescura por categoría y aerolínea"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    # Análisis por categoría
    category_analysis = products_df.groupby('tipo').agg({
        'freshness_score': ['mean', 'min', 'max', 'count'],
        'vida_util_dias': 'mean'
    }).round(2)
    
    # Análisis por aerolínea
    airline_analysis = products_df.groupby('aerolinea').agg({
        'freshness_score': ['mean', 'min', 'max'],
        'product_id': 'count'
    }).round(2)
    
    # Productos con menor frescura (top 5)
    lowest_freshness = products_df.nsmallest(5, 'freshness_score')[['product_id', 'product_name', 'freshness_score', 'vida_util_dias']]
    
    return {
        "by_category": category_analysis.to_dict(),
        "by_airline": airline_analysis.to_dict(),
        "lowest_freshness_products": lowest_freshness.to_dict('records')
    }

@router.get("/consumption-prediction")
def predict_consumption(
    airline: str = Query(..., description="Aerolínea"),
    tickets_sold: int = Query(..., description="Número de tickets vendidos"),
    duration: float = Query(..., description="Duración del vuelo en horas"),
    departure_hour: int = Query(..., description="Hora de despegue (0-23)"),
    age_range: str = Query(..., description="Rango de edad predominante")
):
    """Predecir consumo basado en parámetros del vuelo"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    if model_artifacts is None:
        raise HTTPException(status_code=500, detail="Modelo de predicción no disponible")
    
    try:
        # Filtrar productos de la aerolínea
        airline_products = products_df[products_df['aerolinea'] == airline]
        if airline_products.empty:
            raise HTTPException(status_code=404, detail=f"No se encontraron productos para {airline}")
        
        predictions = []
        total_cost = 0
        total_consumption = 0
        
        for _, product in airline_products.iterrows():
            # Simular predicción (aquí integrarías tu modelo real)
            base_consumption = product['suggested_units'] * 0.85  # 85% del sugerido
            
            # Ajustar por rango de edad
            age_factors = {
                "niños": 0.8,
                "adultos_jovenes": 1.1,
                "adultos": 1.0,
                "adultos_mayores": 0.9
            }
            age_factor = age_factors.get(age_range, 1.0)
            
            # Ajustar por hora del día
            time_factor = 1.2 if 11 <= departure_hour <= 13 else 1.0  # Hora de comida
            
            predicted_consumption = int(base_consumption * age_factor * time_factor)
            cost = predicted_consumption * product['unit_cost']
            
            total_consumption += predicted_consumption
            total_cost += cost
            
            predictions.append({
                'product_id': product['product_id'],
                'product_name': product['product_name'],
                'product_category': product['tipo'],
                'predicted_consumption': predicted_consumption,
                'standard_quantity': product['standard_quantity'],
                'suggested_units': product['suggested_units'],
                'unit_cost': product['unit_cost'],
                'total_cost': cost,
                'freshness_score': product['freshness_score'],
                'acceptance_rate': product['acceptance_rate'],
                'is_reusable': product['reusable']
            })
        
        # Determinar tipo de servicio
        meal_service = determine_meal_service(duration, departure_hour)
        
        return {
            "prediction_parameters": {
                "airline": airline,
                "tickets_sold": tickets_sold,
                "duration": duration,
                "departure_hour": departure_hour,
                "age_range": age_range,
                "meal_service_type": meal_service
            },
            "predictions": predictions,
            "summary": {
                "total_consumption": total_consumption,
                "total_cost": total_cost,
                "cost_per_passenger": total_cost / tickets_sold if tickets_sold > 0 else 0,
                "products_count": len(predictions)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")

@router.get("/inventory-optimization")
def get_inventory_optimization(airline: str = Query(None, description="Filtrar por aerolínea")):
    """Recomendaciones de optimización de inventario"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    analysis_df = products_df.copy()
    
    if airline:
        analysis_df = analysis_df[analysis_df['aerolinea'] == airline]
        if analysis_df.empty:
            raise HTTPException(status_code=404, detail=f"No se encontraron productos para {airline}")
    
    # Calcular métricas de optimización
    analysis_df['consumption_ratio'] = analysis_df['units_consumed'] / analysis_df['standard_quantity']
    analysis_df['waste_ratio'] = analysis_df['units_returned'] / analysis_df['standard_quantity']
    analysis_df['efficiency_score'] = (analysis_df['acceptance_rate'] * analysis_df['freshness_score']) / 100
    
    # Recomendaciones
    recommendations = []
    
    for _, product in analysis_df.iterrows():
        recommendation = {
            'product_id': product['product_id'],
            'product_name': product['product_name'],
            'current_metrics': {
                'acceptance_rate': product['acceptance_rate'],
                'freshness_score': product['freshness_score'],
                'consumption_ratio': round(product['consumption_ratio'] * 100, 1),
                'efficiency_score': round(product['efficiency_score'], 1)
            }
        }
        
        # Generar recomendaciones basadas en métricas
        if product['acceptance_rate'] < 80:
            recommendation['action'] = 'REVIEW'
            recommendation['message'] = 'Baja tasa de aceptación, considerar reemplazo'
        elif product['freshness_score'] < 70:
            recommendation['action'] = 'PRIORITIZE'
            recommendation['message'] = 'Baja frescura, usar prioritariamente'
        elif product['consumption_ratio'] > 0.9:
            recommendation['action'] = 'INCREASE'
            recommendation['message'] = 'Alta demanda, aumentar inventario'
        elif product['consumption_ratio'] < 0.6:
            recommendation['action'] = 'DECREASE'
            recommendation['message'] = 'Baja demanda, reducir inventario'
        else:
            recommendation['action'] = 'MAINTAIN'
            recommendation['message'] = 'Rendimiento óptimo, mantener niveles actuales'
        
        recommendations.append(recommendation)
    
    # Métricas generales
    overall_metrics = {
        'avg_acceptance_rate': analysis_df['acceptance_rate'].mean(),
        'avg_freshness_score': analysis_df['freshness_score'].mean(),
        'total_products': len(analysis_df),
        'high_risk_products': len([r for r in recommendations if r['action'] in ['REVIEW', 'PRIORITIZE']])
    }
    
    return {
        "overall_metrics": overall_metrics,
        "recommendations": recommendations
    }

@router.get("/export-products")
def export_products_data(format: str = Query("csv", description="Formato de exportación: csv o json")):
    """Exportar datos de productos"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    if format.lower() == "json":
        filename = f"products_export_{timestamp}.json"
        products_df.to_json(filename, orient='records', indent=2)
    else:
        filename = f"products_export_{timestamp}.csv"
        products_df.to_csv(filename, index=False)
    
    return FileResponse(
        filename,
        media_type='application/octet-stream',
        filename=filename
    )

@router.post("/update-freshness/{product_id}")
def update_product_freshness(
    product_id: str,
    new_freshness_score: float = Query(..., ge=0, le=100, description="Nuevo score de frescura (0-100)")
):
    """Actualizar el score de frescura de un producto"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    if product_id not in products_df['product_id'].values:
        raise HTTPException(status_code=404, detail=f"Producto {product_id} no encontrado")
    
    # En una implementación real, aquí actualizarías la base de datos
    # Por ahora, solo simulamos la actualización
    product_index = products_df[products_df['product_id'] == product_id].index[0]
    products_df.at[product_index, 'freshness_score'] = new_freshness_score
    
    return {
        "message": f"Freshness score actualizado para {product_id}",
        "product_id": product_id,
        "new_freshness_score": new_freshness_score,
        "updated_at": datetime.now().isoformat()
    }

# Función auxiliar para determinar servicio de comida
def determine_meal_service(duration: float, departure_hour: int) -> str:
    if duration <= 2:
        return "Refreshment"
    elif duration <= 4:
        if 6 <= departure_hour <= 9:
            return "Breakfast Service"
        elif 11 <= departure_hour <= 14:
            return "Light Meal"
        elif 17 <= departure_hour <= 20:
            return "Light Meal"
        else:
            return "Refreshment"
    else:
        if 6 <= departure_hour <= 9:
            return "Breakfast Service"
        elif 11 <= departure_hour <= 14:
            return "Full Service"
        elif 17 <= departure_hour <= 20:
            return "Full Service"
        else:
            return "Full Service"

@router.get("/dashboard-stats")
def get_dashboard_statistics():
    """Estadísticas para el dashboard"""
    if products_df.empty:
        raise HTTPException(status_code=404, detail="No se encontraron datos de productos")
    
    total_products = len(products_df)
    total_airlines = products_df['aerolinea'].nunique()
    total_categories = products_df['tipo'].nunique()
    
    # Productos en riesgo (frescura baja)
    risk_products = len(products_df[products_df['freshness_score'] < 70])
    
    # Productos con baja aceptación
    low_acceptance = len(products_df[products_df['acceptance_rate'] < 75])
    
    # Distribución por categoría
    category_dist = products_df['tipo'].value_counts().to_dict()
    
    # Promedios
    avg_freshness = products_df['freshness_score'].mean()
    avg_acceptance = products_df['acceptance_rate'].mean()
    
    return {
        "total_products": total_products,
        "total_airlines": total_airlines,
        "total_categories": total_categories,
        "risk_products": risk_products,
        "low_acceptance_products": low_acceptance,
        "avg_freshness_score": round(avg_freshness, 1),
        "avg_acceptance_rate": round(avg_acceptance, 1),
        "category_distribution": category_dist
    }