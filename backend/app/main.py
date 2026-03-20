from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import trucks

app = FastAPI(
    title="SF Food Trucks API",
    description=(
        "Search and explore Mobile Food Facility permits in San Francisco. "
        "Data sourced from the SF Open Data portal."
    ),
    version="1.0.0",
)

# Allow requests from the React dev server and any deployed frontend origin.
# Tighten this list to specific origins before deploying to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(trucks.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Simple liveness probe."""
    return {"status": "ok"}
