from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta
import pandas as pd
import os
from typing import Dict, Any, List, Optional

router = APIRouter(prefix="/products", tags=["Products Management"])

def load_products_data_from_csv() -> List[Dict[str, Any]]:
    """
    Carga los datos de productos desde el archivo CSV aumentado
    """
    try:
        # Construir la ruta al archivo CSV
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)  # Salir de routes a app
        backend_dir = os.path.dirname(app_dir)  # Salir de app a backend
        project_root = os.path.dirname(backend_dir)  # Salir de backend al root del proyecto
        data_dir = os.path.join(project_root, 'data')  # Entrar a data
        
        csv_path = os.path.join(data_dir, 'products_data_augmented.csv')
        csv_path = os.path.abspath(csv_path)  # Normalizar la ruta
        
        print(f"=== PRODUCTS AUGMENTED DEBUG INFO ===")
        print(f"Ruta construida del CSV: {csv_path}")
        print(f"¿Existe el directorio data?: {os.path.exists(data_dir)}")
        print(f"¿Existe el archivo CSV?: {os.path.exists(csv_path)}")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Archivo no encontrado: {csv_path}")
        
        # Leer el CSV
        df = pd.read_csv(csv_path)
        print(f"CSV aumentado leído correctamente. Filas: {len(df)}")
        print(f"Columnas: {df.columns.tolist()}")
        print("=================================")
        
        # Convertir a lista de diccionarios y agregar IDs y nombres generados
        products_data = []
        for index, row in df.iterrows():
            product_dict = row.to_dict()
            
            # Generar ID único basado en el índice y datos del producto
            product_id = f"prod-{index:03d}-{product_dict['aerolinea'].replace(' ', '').lower()}"
            
            # Generar nombre descriptivo basado en categoría y tipo
            category = product_dict.get('Category', 'Producto')
            product_type = product_dict.get('tipo', 'General')
            airline = product_dict.get('aerolinea', 'Aerolínea')
            product_name = f"{category} {product_type} - {airline}"
            
            # Agregar campos generados
            product_dict['product_id'] = product_id
            product_dict['product_name'] = product_name
            product_dict['nombre_producto'] = product_name
            product_dict['id'] = product_id
            
            products_data.append(product_dict)
        
        return products_data
        
    except FileNotFoundError as e:
        error_msg = f"Archivo CSV de productos aumentado no encontrado: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Error leyendo CSV de productos aumentado: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

def calculate_expiration_metrics(product: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calcula métricas relacionadas con la expiración basadas en freshness_score
    """
    freshness_score = product.get('freshness_score', 0)
    vida_util_dias = product.get('vida_util_dias', 1)
    
    # Calcular días restantes basado en freshness_score
    dias_restantes = (freshness_score / 100) * vida_util_dias
    
    # Determinar estado de expiración
    if freshness_score >= 80:
        estado = "OPTIMO"
        color = "green"
    elif freshness_score >= 60:
        estado = "ATENCION"
        color = "yellow"
    elif freshness_score >= 40:
        estado = "CRITICO"
        color = "orange"
    else:
        estado = "EXPIRADO"
        color = "red"
    
    # Calcular fecha estimada de expiración (asumiendo fecha actual como referencia)
    fecha_actual = datetime.now()
    fecha_estimada_expiracion = fecha_actual + timedelta(days=dias_restantes)
    
    return {
        "dias_restantes": round(dias_restantes, 1),
        "estado_expiracion": estado,
        "color_estado": color,
        "fecha_estimada_expiracion": fecha_estimada_expiracion.strftime("%Y-%m-%d"),
        "porcentaje_vida_util": freshness_score
    }

@router.get("/")
def test_products():
    return {"message": "Ruta Products Management funcionando correctamente"}

@router.get("/all")
def get_all_products_with_expiration():
    """
    Obtiene todos los productos con información de expiración
    """
    try:
        products_data = load_products_data_from_csv()
        
        # Enriquecer datos con métricas de expiración
        enriched_products = []
        for product in products_data:
            expiration_metrics = calculate_expiration_metrics(product)
            enriched_product = {**product, **expiration_metrics}
            enriched_products.append(enriched_product)
        
        return {
            "total_products": len(enriched_products),
            "products": enriched_products
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/{product_id}")
def get_product_expiration_details(product_id: str):
    """
    Obtiene detalles de expiración de un producto específico
    """
    try:
        products_data = load_products_data_from_csv()
        
        product = next((p for p in products_data if p['product_id'] == product_id), None)
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {product_id} no encontrado")
        
        expiration_metrics = calculate_expiration_metrics(product)
        enriched_product = {**product, **expiration_metrics}
        
        return enriched_product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/alerts/expiration")
def get_expiration_alerts(
    threshold_days: int = Query(7, description="Umbral de días para alertas"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría")
):
    """
    Obtiene alertas de productos próximos a expirar
    """
    try:
        products_data = load_products_data_from_csv()
        
        alert_products = []
        for product in products_data:
            expiration_metrics = calculate_expiration_metrics(product)
            
            # Filtrar por umbral de días
            if expiration_metrics['dias_restantes'] <= threshold_days:
                enriched_product = {**product, **expiration_metrics}
                
                # Aplicar filtros adicionales
                if estado and expiration_metrics['estado_expiracion'] != estado:
                    continue
                if categoria and product.get('Category') != categoria:
                    continue
                
                alert_products.append(enriched_product)
        
        # Ordenar por días restantes (menor a mayor)
        alert_products.sort(key=lambda x: x['dias_restantes'])
        
        return {
            "threshold_days": threshold_days,
            "total_alerts": len(alert_products),
            "alerts": alert_products
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/analysis/category")
def get_expiration_analysis_by_category():
    """
    Análisis de expiración por categoría de producto
    """
    try:
        products_data = load_products_data_from_csv()
        
        # Agrupar por categoría
        categories = {}
        for product in products_data:
            categoria = product.get('Category', 'Sin categoría')
            if categoria not in categories:
                categories[categoria] = {
                    'total_products': 0,
                    'avg_freshness_score': 0,
                    'products_at_risk': 0,
                    'products_expired': 0,
                    'products': []
                }
            
            expiration_metrics = calculate_expiration_metrics(product)
            enriched_product = {**product, **expiration_metrics}
            
            categories[categoria]['total_products'] += 1
            categories[categoria]['avg_freshness_score'] += expiration_metrics['porcentaje_vida_util']
            categories[categoria]['products'].append(enriched_product)
            
            # Contar productos en riesgo
            if expiration_metrics['estado_expiracion'] in ['CRITICO', 'EXPIRADO']:
                categories[categoria]['products_at_risk'] += 1
            if expiration_metrics['estado_expiracion'] == 'EXPIRADO':
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
                "total_products": len(products_data),
                "total_at_risk": sum(cat['products_at_risk'] for cat in categories.values()),
                "total_expired": sum(cat['products_expired'] for cat in categories.values())
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/analysis/airline")
def get_expiration_analysis_by_airline():
    """
    Análisis de expiración por aerolínea
    """
    try:
        products_data = load_products_data_from_csv()
        
        # Agrupar por aerolínea
        airlines = {}
        for product in products_data:
            airline = product.get('aerolinea', 'Sin aerolínea')
            if airline not in airlines:
                airlines[airline] = {
                    'total_products': 0,
                    'avg_freshness_score': 0,
                    'products_at_risk': 0,
                    'products_expired': 0,
                    'categories': set()
                }
            
            expiration_metrics = calculate_expiration_metrics(product)
            
            airlines[airline]['total_products'] += 1
            airlines[airline]['avg_freshness_score'] += expiration_metrics['porcentaje_vida_util']
            airlines[airline]['categories'].add(product.get('Category', 'Sin categoría'))
            
            # Contar productos en riesgo
            if expiration_metrics['estado_expiracion'] in ['CRITICO', 'EXPIRADO']:
                airlines[airline]['products_at_risk'] += 1
            if expiration_metrics['estado_expiracion'] == 'EXPIRADO':
                airlines[airline]['products_expired'] += 1
        
        # Calcular promedios y convertir sets a listas
        for airline in airlines:
            airlines[airline]['avg_freshness_score'] = round(
                airlines[airline]['avg_freshness_score'] / airlines[airline]['total_products'], 
                2
            )
            airlines[airline]['categories'] = list(airlines[airline]['categories'])
        
        return {
            "analysis_by_airline": airlines,
            "summary": {
                "total_airlines": len(airlines),
                "highest_freshness_airline": max(airlines.items(), key=lambda x: x[1]['avg_freshness_score'])[0],
                "lowest_freshness_airline": min(airlines.items(), key=lambda x: x[1]['avg_freshness_score'])[0]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/priority/rotation")
def get_rotation_priority():
    """
    Obtiene prioridad de rotación de productos basada en frescura
    """
    try:
        products_data = load_products_data_from_csv()
        
        # Enriquecer todos los productos con métricas de expiración
        enriched_products = []
        for product in products_data:
            expiration_metrics = calculate_expiration_metrics(product)
            enriched_product = {**product, **expiration_metrics}
            enriched_products.append(enriched_product)
        
        # Ordenar por prioridad (menor freshness_score primero)
        priority_products = sorted(
            enriched_products, 
            key=lambda x: x['freshness_score']
        )
        
        # Agrupar por nivel de prioridad
        high_priority = [p for p in priority_products if p['freshness_score'] < 60]
        medium_priority = [p for p in priority_products if 60 <= p['freshness_score'] < 80]
        low_priority = [p for p in priority_products if p['freshness_score'] >= 80]
        
        return {
            "rotation_priority": {
                "high_priority": {
                    "count": len(high_priority),
                    "products": high_priority[:10]  # Top 10 más críticos
                },
                "medium_priority": {
                    "count": len(medium_priority),
                    "products": medium_priority[:10]
                },
                "low_priority": {
                    "count": len(low_priority),
                    "products": low_priority[:10]
                }
            },
            "recommendations": {
                "immediate_action": f"Rotar {len(high_priority)} productos de alta prioridad",
                "monitor": f"Vigilar {len(medium_priority)} productos de prioridad media",
                "stable": f"{len(low_priority)} productos en estado estable"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/dashboard/stats")
def get_expiration_dashboard_stats():
    """
    Estadísticas para el dashboard de gestión de expiración
    """
    try:
        products_data = load_products_data_from_csv()
        
        total_products = len(products_data)
        total_categories = len(set(p.get('Category') for p in products_data))
        total_airlines = len(set(p.get('aerolinea') for p in products_data))
        
        # Calcular productos por estado
        status_counts = {'OPTIMO': 0, 'ATENCION': 0, 'CRITICO': 0, 'EXPIRADO': 0}
        avg_freshness = 0
        
        for product in products_data:
            expiration_metrics = calculate_expiration_metrics(product)
            status = expiration_metrics['estado_expiracion']
            status_counts[status] += 1
            avg_freshness += expiration_metrics['porcentaje_vida_util']
        
        avg_freshness = round(avg_freshness / total_products, 2) if total_products > 0 else 0
        
        # Productos que requieren atención inmediata (CRITICO + EXPIRADO)
        immediate_attention = status_counts['CRITICO'] + status_counts['EXPIRADO']
        
        return {
            "overview": {
                "total_products": total_products,
                "total_categories": total_categories,
                "total_airlines": total_airlines,
                "avg_freshness_score": avg_freshness
            },
            "status_distribution": status_counts,
            "alerts": {
                "immediate_attention": immediate_attention,
                "attention_required": status_counts['ATENCION'],
                "stable": status_counts['OPTIMO']
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")