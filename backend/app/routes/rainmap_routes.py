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

    lon_step = (max_lon - min_lon) / (grid_size - 1)
    lat_step = (max_lat - min_lat) / (grid_size - 1)

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
    if rain > 5:
        return "Heavy rain"
    elif rain > 1:
        return "Light rain"
    elif rain > 0:
        return "Drizzle"
    elif cloud_cover > 70:
        return "Cloudy"
    elif cloud_cover > 30:
        return "Partly cloudy"
    else:
        return "Clear"


def get_weather_icon(status: str) -> str:
    """Get weather icon based on status"""
    if "rain" in status.lower():
        return WEATHER_ICONS["rain"]
    elif "thunder" in status.lower():
        return WEATHER_ICONS["thunderstorm"]
    elif "cloud" in status.lower():
        return WEATHER_ICONS["cloudy"]
    elif "clear" in status.lower():
        return WEATHER_ICONS["clear"]
    elif "drizzle" in status.lower():
        return WEATHER_ICONS["rain"]
    else:
        return WEATHER_ICONS["unknown"]


@router.get("/")
def get_prediction(grid_size: int = 15):
    """Get current weather for grid points across Mexico"""
    grid_points = generate_grid_points(grid_size)
    grid_data = []
    current_time = datetime.now(timezone.utc)

    try:
        for point in grid_points:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": point["lat"],
                "longitude": point["lon"],
                "hourly": "temperature_2m,rain,cloud_cover",
                "timezone": "auto",
                "forecast_days": 1,
            }

            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            hourly = data.get("hourly", {})

            if not hourly or not hourly.get("time"):
                continue

            current_hour_index = 0

            temperature = hourly.get("temperature_2m", [0])[current_hour_index]
            rain = hourly.get("rain", [0])[current_hour_index]
            cloud_cover = hourly.get("cloud_cover", [0])[current_hour_index]

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
