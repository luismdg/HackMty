from fastapi import APIRouter
import requests
from datetime import datetime, timezone
from typing import List, Dict

router = APIRouter()

# Weather condition mapping
WEATHER_ICONS = {
    "clear": "☀️",
    "partly_cloudy": "⛅",
    "cloudy": "☁️",
    "rain": "🌧️",
    "thunderstorm": "⛈️",
    "snow": "❄️",
    "fog": "🌫️",
    "unknown": "❓",
}


def generate_grid_points(grid_size: int = 15) -> List[Dict[str, float]]:
    """Generate grid points within Mexico bounds"""
    mexico_bounds = [
        [-118, 14.5],  # SW [minLon, minLat]
        [-86.5, 32.75],  # NE [maxLon, maxLat]
    ]

    points = []

    min_lon = mexico_bounds[0][0]
    max_lon = mexico_bounds[1][0]
    min_lat = mexico_bounds[0][1]
    max_lat = mexico_bounds[1][1]

    lon_step = (max_lon - min_lon) / (grid_size - 1) if grid_size > 1 else 0
    lat_step = (max_lat - min_lat) / (grid_size - 1) if grid_size > 1 else 0

    # Generate grid points
    for row in range(grid_size):
        for col in range(grid_size):
            longitude = min_lon + (col * lon_step)
            latitude = min_lat + (row * lat_step)

            points.append(
                {
                    "name": f"Grid_{row}_{col}",
                    "lat": round(latitude, 4),
                    "lon": round(longitude, 4),
                }
            )

    return points


def get_weather_status(rain: float, cloud_cover: float) -> str:
    """Determine weather status based on rain and cloud cover"""
    if rain > 5:  # Heavy rain
        return "Heavy rain"
    elif rain > 1:  # Light rain
        return "Light rain"
    elif rain > 0:  # Drizzle
        return "Drizzle"
    elif cloud_cover > 70:  # Cloudy
        return "Cloudy"
    elif cloud_cover > 30:  # Partly cloudy
        return "Partly cloudy"
    else:  # Clear
        return "Clear"


def get_weather_icon(status: str) -> str:
    """Get weather icon based on status"""
    if "rain" in status.lower():
        return WEATHER_ICONS["rain"]
    elif "thunder" in status.lower():
        return WEATHER_ICONS["thunderstorm"]
    elif "cloud" in status.lower():
        return "☁️" if status == "Cloudy" else "⛅"
    elif "clear" in status.lower():
        return WEATHER_ICONS["clear"]
    elif "drizzle" in status.lower():
        return WEATHER_ICONS["rain"]
    else:
        return WEATHER_ICONS["unknown"]


@router.get("/predict")
def get_prediction(grid_size: int = 15):
    """Get current weather for grid points across Mexico"""
    grid_points = generate_grid_points(grid_size)
    grid_data = []
    current_time = datetime.now(timezone.utc)

    try:
        for point in grid_points:
            # Build the API URL with correct parameter names
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": point["lat"],
                "longitude": point["lon"],
                "hourly": "temperature_2m,rain,cloud_cover",
                "timezone": "auto",
                "forecast_days": 1,
            }

            # Make the API request
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            # Debug: Print the first point's data structure
            if not grid_data:  # Only for first point
                print(f"First point API response keys: {data.keys()}")
                if "hourly" in data:
                    print(f"Hourly keys: {data['hourly'].keys()}")
                    print(f"Sample data - Time: {data['hourly']['time'][:5]}")
                    print(f"Sample data - Temp: {data['hourly']['temperature_2m'][:5]}")
                    print(f"Sample data - Rain: {data['hourly']['rain'][:5]}")
                    print(f"Sample data - Cloud: {data['hourly']['cloud_cover'][:5]}")

            # Extract current data (first hour of the hourly data)
            hourly = data.get("hourly", {})

            # Check if we have data
            if not hourly or not hourly.get("time"):
                print(f"No hourly data for point {point['name']}")
                continue

            current_hour_index = 0  # First entry should be current hour

            # Safely extract data with defaults
            temperature_data = hourly.get("temperature_2m", [])
            rain_data = hourly.get("rain", [])
            cloud_cover_data = hourly.get("cloud_cover", [])

            temperature = (
                temperature_data[current_hour_index] if temperature_data else 0
            )
            rain = rain_data[current_hour_index] if rain_data else 0
            cloud_cover = (
                cloud_cover_data[current_hour_index] if cloud_cover_data else 0
            )

            # Determine weather status
            status = get_weather_status(rain, cloud_cover)
            icon = get_weather_icon(status)

            grid_data.append(
                {
                    "id": point["name"],
                    "latitude": point["lat"],
                    "longitude": point["lon"],
                    "temperature": float(temperature),
                    "rain": float(rain),
                    "cloud_cover": float(cloud_cover),
                    "status": status,
                    "icon": icon,
                    "display_text": f"{icon} {point['name']}: {temperature}°C - {status}",
                    "last_updated": current_time.isoformat(),
                }
            )

        return {
            "grid_size": grid_size,
            "total_points": len(grid_points),
            "bounds": {"southwest": [-118, 14.5], "northeast": [-86.5, 32.75]},
            "data": grid_data,
        }

    except requests.exceptions.RequestException as e:
        return {"error": f"Weather API request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}
