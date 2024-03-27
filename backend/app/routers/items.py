"""Feature routes."""

from fastapi import APIRouter, Security

from app.dependencies.items import HomesFinder
from app.dependencies.security import verify_api_key
from app.models.items import Property, Request

# Program
find_homes = HomesFinder()


router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


@router.post("/home-data", response_model=dict[str, list[Property]])
async def home_data(request: Request):
    """Get home data from query."""
    return {
        "data": find_homes(request.query).homes,
    }
