# app/routes/storm_routes.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/images")
async def get_storm_images():
    """
    Return a list or URLs of storm images.
    Later this can fetch from a folder or S3 bucket.
    """
    example_images = [
        "https://example.com/storm1.png",
        "https://example.com/storm2.png",
    ]
    return {"images": example_images}


@router.get("/json")
async def get_storm_data():
    """
    Return JSON details about active storms.
    Later you can connect this to your Tropycal or NOAA data sources.
    """
    storm_data = {
        "active_storms": [
            {"name": "Hurricane Alex", "wind_speed": 120, "location": "Gulf of Mexico"},
            {"name": "Tropical Storm Bonnie", "wind_speed": 80, "location": "Atlantic"},
        ]
    }
    return JSONResponse(content=storm_data)
