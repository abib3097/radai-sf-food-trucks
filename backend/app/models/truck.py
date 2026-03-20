from pydantic import BaseModel
from typing import Optional


class FoodTruck(BaseModel):
    location_id: Optional[str] = None
    applicant: Optional[str] = None
    facility_type: Optional[str] = None
    location_description: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    food_items: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    days_hours: Optional[str] = None


class NearestTruckResult(FoodTruck):
    distance_meters: Optional[float] = None
    distance_method: str = "haversine"  # "haversine" or "google_maps"