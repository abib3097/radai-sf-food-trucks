import os
import requests
import pandas as pd
from typing import Optional
from app.models.truck import FoodTruck, NearestTruckResult

# Resolve path to CSV relative to this file
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/food_trucks.csv")

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

# Maps raw CSV column names to clean snake_case equivalents.
# Any column not listed here is dropped — keeps the DataFrame lean.
COLUMN_RENAME_MAP = {
    "locationid": "location_id",
    "applicant": "applicant",
    "facilitytype": "facility_type",
    "locationdescription": "location_description",
    "address": "address",
    "status": "status",
    "fooditems": "food_items",
    "latitude": "latitude",
    "longitude": "longitude",
    "dayshours": "days_hours",
}


def _str_or_none(value) -> Optional[str]:
    """Return None if value is NaN, otherwise cast to string."""
    if pd.isna(value):
        return None
    return str(value)


def _load_data() -> pd.DataFrame:
    """
    Load the food trucks CSV and normalize it:
    - Lowercase and strip all column names
    - Rename raw CSV columns to clean snake_case names
    - Drop any columns not in the rename map
    - Coerce latitude/longitude to numeric
    """
    df = pd.read_csv(DATA_PATH)

    # Normalize raw column names before renaming
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Keep and rename only the columns we care about
    existing_cols = {k: v for k, v in COLUMN_RENAME_MAP.items() if k in df.columns}
    df = df[list(existing_cols.keys())].rename(columns=existing_cols)

    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")

    return df


def _row_to_truck(row: pd.Series) -> FoodTruck:
    """Map a DataFrame row to a FoodTruck model."""
    return FoodTruck(
        location_id=_str_or_none(row.get("location_id")),
        applicant=_str_or_none(row.get("applicant")),
        facility_type=_str_or_none(row.get("facility_type")),
        location_description=_str_or_none(row.get("location_description")),
        address=_str_or_none(row.get("address")),
        status=_str_or_none(row.get("status")),
        food_items=_str_or_none(row.get("food_items")),
        latitude=row.get("latitude") if pd.notna(row.get("latitude")) else None,
        longitude=row.get("longitude") if pd.notna(row.get("longitude")) else None,
        days_hours=_str_or_none(row.get("days_hours")),
    )


def search_by_applicant(name: str, status: Optional[str] = None) -> list[FoodTruck]:
    """
    Search food trucks by applicant name (case-insensitive partial match).
    Optionally filter by status (e.g. APPROVED, REQUESTED, EXPIRED).
    """
    df = _load_data()

    mask = df["applicant"].str.contains(name, case=False, na=False)
    if status:
        mask &= df["status"].str.upper() == status.upper()

    return [_row_to_truck(row) for _, row in df[mask].iterrows()]


def search_by_street(street: str) -> list[FoodTruck]:
    """
    Search food trucks by partial street name match against the address field.
    Example: "SAN" matches trucks on "SANSOME ST".
    """
    df = _load_data()

    mask = df["address"].str.contains(street, case=False, na=False)
    return [_row_to_truck(row) for _, row in df[mask].iterrows()]


def get_nearest_trucks(
    latitude: float,
    longitude: float,
    approved_only: bool = True,
    limit: int = 5,
) -> list[NearestTruckResult]:
    """
    Return the N nearest food trucks to a given latitude/longitude.

    Distance is calculated using Haversine (straight-line) by default — no API key required.
    If GOOGLE_MAPS_API_KEY is set in the environment, the Google Maps Distance Matrix API
    is used instead for real road-travel distances.

    Each result includes a `distance_method` field ("haversine" or "google_maps") so the
    caller can see which calculation path was taken.

    By default only returns APPROVED trucks; set approved_only=False to include all statuses.
    """
    df = _load_data()

    # Drop rows without coordinates
    df = df.dropna(subset=["latitude", "longitude"])

    if approved_only:
        df = df[df["status"].str.upper() == "APPROVED"]

    if df.empty:
        return []

    # Haversine is the default — works out of the box with no external API key.
    # Google Maps is opt-in: set GOOGLE_MAPS_API_KEY in your .env to enable it.
    if GOOGLE_MAPS_API_KEY:
        return _nearest_via_google_maps(latitude, longitude, df, limit)

    return _nearest_via_haversine(latitude, longitude, df, limit)


def _nearest_via_google_maps(
    origin_lat: float,
    origin_lng: float,
    df: pd.DataFrame,
    limit: int,
) -> list[NearestTruckResult]:
    """
    Use Google Maps Distance Matrix API to find the nearest trucks.
    We pre-filter to a reasonable candidate set using Haversine first,
    then call the API with up to 25 destinations (API limit per request).
    """
    # Pre-filter to closest 25 candidates by straight-line distance to stay within API limits
    candidates = _nearest_via_haversine(origin_lat, origin_lng, df, limit=25)

    destinations = "|".join(
        f"{t.latitude},{t.longitude}" for t in candidates if t.latitude and t.longitude
    )

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": destinations,
        "key": GOOGLE_MAPS_API_KEY,
        "units": "metric",
    }

    response = requests.get(url, params=params, timeout=5)
    response.raise_for_status()
    data = response.json()

    rows = data.get("rows", [])
    if not rows:
        # API returned no rows — fall back to Haversine candidates
        return candidates[:limit]

    elements = rows[0].get("elements", [])

    # Pair each candidate with its Google Maps distance
    scored: list[tuple[NearestTruckResult, float]] = []
    for truck, element in zip(candidates, elements):
        if element.get("status") == "OK":
            distance_m = element["distance"]["value"]
        else:
            # Element failed (e.g. no route found) — sort it to the end
            distance_m = float("inf")

        result = NearestTruckResult(
            **truck.model_dump(exclude={"distance_method", "distance_meters"}),
            distance_meters=distance_m,
            distance_method="google_maps",
        )
        scored.append((result, distance_m))

    scored.sort(key=lambda x: x[1])
    return [item for item, _ in scored[:limit]]


def _nearest_via_haversine(
    origin_lat: float,
    origin_lng: float,
    df: pd.DataFrame,
    limit: int,
) -> list[NearestTruckResult]:
    """
    Compute straight-line distances using the Haversine formula and return
    the closest N trucks. Used as the default distance method, and as a
    pre-filter before calling the Google Maps Distance Matrix API.
    """
    from math import radians, cos, sin, asin, sqrt

    def haversine(lat2: float, lon2: float) -> float:
        R = 6_371_000  # Earth radius in meters
        phi1, phi2 = radians(origin_lat), radians(lat2)
        dphi = radians(lat2 - origin_lat)
        dlambda = radians(lon2 - origin_lng)
        a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
        return 2 * R * asin(sqrt(a))

    df = df.copy()
    df["_distance"] = df.apply(
        lambda row: haversine(row["latitude"], row["longitude"]), axis=1
    )
    df = df.sort_values("_distance").head(limit)

    results = []
    for _, row in df.iterrows():
        truck = _row_to_truck(row)
        results.append(
            NearestTruckResult(
                **truck.model_dump(),
                distance_meters=row["_distance"],
                distance_method="haversine",
            )
        )
    return results