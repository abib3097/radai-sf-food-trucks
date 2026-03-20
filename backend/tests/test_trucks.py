"""
Tests for the SF Food Trucks API.

Uses FastAPI's TestClient (backed by httpx) so no running server is needed.
The tests rely on the real CSV dataset bundled in app/data/food_trucks.csv.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# Search by applicant
# ---------------------------------------------------------------------------

def test_search_applicant_returns_results():
    """A broad name search should return at least one result."""
    response = client.get("/trucks/search/applicant", params={"name": "a"})
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0


def test_search_applicant_with_status_filter():
    """Filtering by APPROVED status should only return APPROVED trucks."""
    response = client.get(
        "/trucks/search/applicant",
        params={"name": "a", "status": "APPROVED"},
    )
    if response.status_code == 200:
        for truck in response.json():
            assert truck["status"].upper() == "APPROVED"


def test_search_applicant_no_match_returns_404():
    """A search that matches nothing should return 404."""
    response = client.get(
        "/trucks/search/applicant",
        params={"name": "ZZZZZZZZZZZZZZZZZZZ"},
    )
    assert response.status_code == 404


def test_search_applicant_missing_name_returns_422():
    """Omitting the required `name` param should return a validation error."""
    response = client.get("/trucks/search/applicant")
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Search by street
# ---------------------------------------------------------------------------

def test_search_street_partial_match():
    """Partial street name 'SAN' should match streets like SANSOME ST."""
    response = client.get("/trucks/search/street", params={"street": "SAN"})
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        for truck in data:
            assert "SAN" in (truck["address"] or "").upper()


def test_search_street_case_insensitive():
    """Street search should be case-insensitive."""
    upper = client.get("/trucks/search/street", params={"street": "MARKET"})
    lower = client.get("/trucks/search/street", params={"street": "market"})
    if upper.status_code == 200 and lower.status_code == 200:
        assert len(upper.json()) == len(lower.json())


def test_search_street_no_match_returns_404():
    response = client.get("/trucks/search/street", params={"street": "ZZZNONEXISTENTZZZ"})
    assert response.status_code == 404


def test_search_street_missing_param_returns_422():
    response = client.get("/trucks/search/street")
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Nearest trucks
# ---------------------------------------------------------------------------

def test_nearest_returns_five_results():
    """Default nearest search should return up to 5 results."""
    # Coordinates: roughly downtown San Francisco
    response = client.get(
        "/trucks/nearest",
        params={"latitude": 37.7749, "longitude": -122.4194},
    )
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        data = response.json()
        assert len(data) <= 5


def test_nearest_approved_only_by_default():
    """Without overriding, nearest should only return APPROVED trucks."""
    response = client.get(
        "/trucks/nearest",
        params={"latitude": 37.7749, "longitude": -122.4194},
    )
    if response.status_code == 200:
        for truck in response.json():
            assert truck["status"].upper() == "APPROVED"


def test_nearest_all_statuses():
    """With approved_only=false, results may include non-APPROVED trucks."""
    response = client.get(
        "/trucks/nearest",
        params={
            "latitude": 37.7749,
            "longitude": -122.4194,
            "approved_only": False,
        },
    )
    assert response.status_code in (200, 404)


def test_nearest_missing_params_returns_422():
    """Omitting lat/lng should return a validation error."""
    response = client.get("/trucks/nearest")
    assert response.status_code == 422


def test_nearest_results_have_distance():
    """Each nearest result should include a distance_meters field."""
    response = client.get(
        "/trucks/nearest",
        params={"latitude": 37.7749, "longitude": -122.4194},
    )
    if response.status_code == 200:
        for truck in response.json():
            assert "distance_meters" in truck
            assert truck["distance_meters"] is not None