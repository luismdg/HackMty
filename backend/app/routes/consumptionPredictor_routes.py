from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import os
from typing import Dict, Any, List, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import numpy as np

router = APIRouter(prefix="/prediction", tags=["Food Consumption Prediction"])

# Variables globales para el modelo
rf_model = None
model_trained = False

def load_food_consumption_data() -> pd.DataFrame:
    """
    Carga los datos de consumo de alimentos desde el archivo CSV
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)  # Salir de routes a app
        backend_dir = os.path.dirname(app_dir)  # Salir de app a backend
        project_root = os.path.dirname(backend_dir)  # Salir de backend al root del proyecto
        data_dir = os.path.join(project_root, 'data')  # Entrar a data
        
        csv_path = os.path.join(data_dir, 'products_data_augmented.csv')
        csv_path = os.path.abspath(csv_path)
        
        print(f"Buscando archivo de datos de consumo en: {csv_path}")
        print(f"¿Existe el archivo?: {os.path.exists(csv_path)}")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Archivo no encontrado: {csv_path}")
        
        # Leer el CSV
        df = pd.read_csv(csv_path)
        print(f"CSV de consumo leído correctamente. Filas: {len(df)}")
        print(f"Columnas: {df.columns.tolist()}")
        
        return df
        
    except Exception as e:
        error_msg = f"Error leyendo CSV de consumo: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

def train_prediction_model():
    """
    Entrena el modelo de predicción de consumo de alimentos
    """
    global rf_model, model_trained
    
    try:
        print("Iniciando entrenamiento del modelo de predicción...")
        df = load_food_consumption_data()
        
        # Verificar que las columnas necesarias existan
        required_columns = ['standard_quantity', 'units_returned', 'suggested_units', 'overload_units']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(f"Columnas faltantes en el dataset: {missing_columns}")
        
        # Seleccionar features y targets
        X = df[['standard_quantity', 'units_returned']]  # features
        y = df[['suggested_units', 'overload_units']]   # targets
        
        print(f"Dimensiones de X: {X.shape}")
        print(f"Dimensiones de y: {y.shape}")
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Entrenar modelo
        rf_model = RandomForestRegressor(n_estimators=200, random_state=42)
        rf_model.fit(X_train, y_train)
        
        # Evaluar modelo
        y_pred = rf_model.predict(X_test)
        mse = np.mean((y_test - y_pred) ** 2)
        r2 = rf_model.score(X_test, y_test)
        
        print("Modelo entrenado exitosamente:")
        print(f"Mean Squared Error: {mse:.4f}")
        print(f"R^2 Score: {r2:.4f}")
        
        model_trained = True
        
        return {
            "status": "success",
            "message": "Modelo entrenado exitosamente",
            "metrics": {
                "mean_squared_error": round(mse, 4),
                "r2_score": round(r2, 4),
                "training_samples": len(X_train),
                "test_samples": len(X_test)
            }
        }
        
    except Exception as e:
        error_msg = f"Error entrenando el modelo: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@router.on_event("startup")
async def startup_event():
    """
    Entrena el modelo automáticamente al iniciar la aplicación
    """
    try:
        print("Iniciando entrenamiento del modelo al startup...")
        train_prediction_model()
    except Exception as e:
        print(f"Error durante startup del modelo: {e}")

@router.get("/train-model")
def train_model():
    """
    Endpoint para entrenar el modelo manualmente
    """
    try:
        result = train_prediction_model()
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/predict")
def predict_consumption(
    standard_quantity: float = Query(..., description="Cantidad estándar del producto"),
    units_returned: float = Query(..., description="Unidades devueltas históricamente")
):
    """
    Predice el consumo de alimentos para un vuelo específico
    """
    global rf_model, model_trained
    
    try:
        if not model_trained or rf_model is None:
            raise HTTPException(status_code=503, detail="Modelo no entrenado. Por favor, espere o entrene el modelo primero.")
        
        # Preparar datos para predicción
        new_data = pd.DataFrame({
            'standard_quantity': [standard_quantity],
            'units_returned': [units_returned]
        })
        
        # Realizar predicción
        prediction = rf_model.predict(new_data)
        
        suggested_units = round(float(prediction[0][0]), 2)
        overload_units = round(float(prediction[0][1]), 2)
        
        # Calcular métricas adicionales
        total_units = suggested_units + overload_units
        acceptance_rate = min(100, max(0, (1 - (units_returned / standard_quantity)) * 100)) if standard_quantity > 0 else 0
        efficiency_score = min(100, max(0, (suggested_units / standard_quantity) * 100)) if standard_quantity > 0 else 0
        
        return {
            "prediction": {
                "suggested_units": suggested_units,
                "overload_units": overload_units,
                "total_required": total_units
            },
            "metrics": {
                "acceptance_rate": round(acceptance_rate, 2),
                "efficiency_score": round(efficiency_score, 2),
                "waste_reduction_potential": round(100 - acceptance_rate, 2)
            },
            "recommendations": {
                "base_stock": suggested_units,
                "safety_margin": overload_units,
                "confidence_level": "high" if acceptance_rate > 80 else "medium" if acceptance_rate > 60 else "low"
            },
            "input_parameters": {
                "standard_quantity": standard_quantity,
                "units_returned": units_returned
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la predicción: {str(e)}")

@router.get("/batch-predict")
def batch_predict_consumption(
    flight_data: str = Query(..., description="Datos de vuelos en formato: 'cantidad1,devueltos1;cantidad2,devueltos2;...'")
):
    """
    Predice el consumo para múltiples vuelos a la vez
    """
    global rf_model, model_trained
    
    try:
        if not model_trained or rf_model is None:
            raise HTTPException(status_code=503, detail="Modelo no entrenado. Por favor, espere o entrene el modelo primero.")
        
        # Parsear datos de entrada
        predictions = []
        flight_entries = flight_data.split(';')
        
        for i, entry in enumerate(flight_entries):
            try:
                if entry.strip():
                    std_qty, units_ret = map(float, entry.split(','))
                    
                    # Realizar predicción individual
                    new_data = pd.DataFrame({
                        'standard_quantity': [std_qty],
                        'units_returned': [units_ret]
                    })
                    
                    prediction = rf_model.predict(new_data)
                    suggested_units = round(float(prediction[0][0]), 2)
                    overload_units = round(float(prediction[0][1]), 2)
                    
                    predictions.append({
                        "flight_id": f"FLIGHT_{i+1}",
                        "input": {
                            "standard_quantity": std_qty,
                            "units_returned": units_ret
                        },
                        "prediction": {
                            "suggested_units": suggested_units,
                            "overload_units": overload_units,
                            "total_required": suggested_units + overload_units
                        },
                        "acceptance_rate": round(min(100, max(0, (1 - (units_ret / std_qty)) * 100)) if std_qty > 0 else 0, 2)
                    })
                    
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Formato incorrecto en entrada {i+1}: {entry}. Use 'cantidad,devueltos'")
        
        # Calcular estadísticas del lote
        total_suggested = sum(p["prediction"]["suggested_units"] for p in predictions)
        total_overload = sum(p["prediction"]["overload_units"] for p in predictions)
        avg_acceptance = np.mean([p["acceptance_rate"] for p in predictions]) if predictions else 0
        
        return {
            "batch_predictions": predictions,
            "summary": {
                "total_flights": len(predictions),
                "total_suggested_units": round(total_suggested, 2),
                "total_overload_units": round(total_overload, 2),
                "grand_total": round(total_suggested + total_overload, 2),
                "average_acceptance_rate": round(avg_acceptance, 2)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción por lote: {str(e)}")

@router.get("/model-info")
def get_model_info():
    """
    Obtiene información sobre el modelo entrenado
    """
    global rf_model, model_trained
    
    try:
        if not model_trained or rf_model is None:
            return {
                "status": "not_trained",
                "message": "El modelo no ha sido entrenado aún"
            }
        
        df = load_food_consumption_data()
        
        return {
            "status": "trained",
            "model_type": "RandomForestRegressor",
            "features": ["standard_quantity", "units_returned"],
            "targets": ["suggested_units", "overload_units"],
            "training_data_info": {
                "total_samples": len(df),
                "features_description": {
                    "standard_quantity": "Cantidad estándar del producto",
                    "units_returned": "Unidades devueltas históricamente"
                },
                "targets_description": {
                    "suggested_units": "Unidades sugeridas para el vuelo",
                    "overload_units": "Unidades adicionales de margen de seguridad"
                }
            },
            "model_parameters": {
                "n_estimators": rf_model.n_estimators,
                "random_state": rf_model.random_state
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo información del modelo: {str(e)}")

@router.get("/flight-recommendation/{flight_id}")
def get_flight_recommendation(flight_id: str):
    """
    Obtiene recomendaciones de consumo para un vuelo específico
    basado en datos históricos
    """
    global rf_model, model_trained
    
    try:
        if not model_trained or rf_model is None:
            raise HTTPException(status_code=503, detail="Modelo no entrenado")
        
        # Simular datos de vuelo (en producción, esto vendría de una base de datos)
        flight_data_map = {
            "CTL395": {"standard_quantity": 150, "units_returned": 25},
            "AA1234": {"standard_quantity": 200, "units_returned": 15},
            "DL7890": {"standard_quantity": 180, "units_returned": 30},
            "UA4567": {"standard_quantity": 120, "units_returned": 10}
        }
        
        flight_data = flight_data_map.get(flight_id, {"standard_quantity": 100, "units_returned": 20})
        
        # Realizar predicción
        prediction_response = predict_consumption(
            standard_quantity=flight_data["standard_quantity"],
            units_returned=flight_data["units_returned"]
        )
        
        # Añadir información específica del vuelo
        prediction_response["flight_info"] = {
            "flight_id": flight_id,
            "historical_data": flight_data
        }
        
        # Añadir recomendaciones adicionales basadas en la predicción
        suggested = prediction_response["prediction"]["suggested_units"]
        overload = prediction_response["prediction"]["overload_units"]
        
        if prediction_response["metrics"]["acceptance_rate"] > 85:
            recommendation = "Alta eficiencia - Mantener niveles actuales"
        elif prediction_response["metrics"]["acceptance_rate"] > 70:
            recommendation = "Eficiencia media - Considerar optimización"
        else:
            recommendation = "Baja eficiencia - Revisar estrategia de inventario"
        
        prediction_response["flight_recommendations"] = {
            "inventory_strategy": recommendation,
            "suggested_adjustment": round(suggested - flight_data["standard_quantity"], 2),
            "risk_level": "low" if overload < 20 else "medium" if overload < 40 else "high"
        }
        
        return prediction_response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando recomendación para vuelo: {str(e)}")