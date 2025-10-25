from fastapi import APIRouter

router = APIRouter(prefix="/enfoque2", tags=["Consumption Predictor"])

@router.get("/{flight_id}/products")
def get_flight_products(flight_id: str):
    # Datos de prueba - solo productos
    products_data = {
        "CTL395": [
            {
                "productId": "BEV001",
                "productName": "Coca-Cola",
                "unitCost": 1.5,
                "reusableFlag": False,
                "foodType": "beverage",
                "standardQuantity": 350,
                "unitsReturned": 45,
                "unitsConsumed": 305,
                "suggestedUnits": 320,
                "overloadUnits": 30,
            },
            {
                "productId": "MEAL001",
                "productName": "Chicken Pasta",
                "unitCost": 8.5,
                "reusableFlag": False,
                "foodType": "main meal",
                "standardQuantity": 280,
                "unitsReturned": 35,
                "unitsConsumed": 245,
                "suggestedUnits": 260,
                "overloadUnits": 20,
            },
            {
                "productId": "SNK001",
                "productName": "Pretzels",
                "unitCost": 2.0,
                "reusableFlag": False,
                "foodType": "snack",
                "standardQuantity": 300,
                "unitsReturned": 55,
                "unitsConsumed": 245,
                "suggestedUnits": 270,
                "overloadUnits": 30,
            },
            {
                "productId": "BEV002",
                "productName": "Coffee",
                "unitCost": 2.5,
                "reusableFlag": True,
                "foodType": "beverage",
                "standardQuantity": 400,
                "unitsReturned": 120,
                "unitsConsumed": 280,
                "suggestedUnits": 300,
                "overloadUnits": 20,
            },
        ]
    }
    
    # Retornar productos del vuelo específico o datos por defecto
    return products_data.get(flight_id, products_data["CTL395"])