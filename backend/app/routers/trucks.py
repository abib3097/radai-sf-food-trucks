from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from app.models.truck import FoodTruck, NearestTruckResult
from app.services import truck_service

router = APIRouter(prefix="/trucks", tags=["Food Trucks"])


@router.get(
    "/search/applicant",
    response_model=list[FoodTruck],
    summary="Search by applicant name",
    description=(
            "Search food trucks by applicant name (case-insensitive partial match). "
            "Optionally filter by status: APPROVED, REQUESTED, EXPIRED, etc."
    ),
)
def search_by_applicant(
        name: str = Query(..., description="Partial or full applicant name"),
        status: Optional[str] = Query(None, description="Filter by permit status (e.g. APPROVED)"),
):
    results = truck_service.search_by_applicant(name=name, status=status)
    if not results:
        raise HTTPException(status_code=404, detail="No food trucks found for the given applicant.")
    return results


@router.get(
    "/search/street",
    response_model=list[FoodTruck],
    summary="Search by street name",
    description=(
            "Search food trucks by partial street name. "
            "Example: 'SAN' matches trucks on 'SANSOME ST'."
    ),
)
def search_by_street(
        street: str = Query(..., description="Partial or full street name"),
):
    results = truck_service.search_by_street(street=street)
    if not results:
        raise HTTPException(status_code=404, detail="No food trucks found on the given street.")
    return results


@router.get(
    "/nearest",
    response_model=list[NearestTruckResult],
    summary="Find nearest food trucks",
    description=(
            "Return the 5 nearest food trucks to a given latitude and longitude. "
            "By default only returns APPROVED trucks. Set approved_only=false to include all statuses."
    ),
)
def get_nearest(
        latitude: float = Query(..., description="Origin latitude"),
        longitude: float = Query(..., description="Origin longitude"),
        approved_only: bool = Query(True, description="Restrict results to APPROVED permits only"),
):
    results = truck_service.get_nearest_trucks(
        latitude=latitude,
        longitude=longitude,
        approved_only=approved_only,
    )
    if not results:
        raise HTTPException(status_code=404, detail="No food trucks found near the given location.")
    return results
