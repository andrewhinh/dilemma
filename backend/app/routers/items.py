"""Feature routes."""

from fastapi import APIRouter, Security

from app.dependencies.items import get_home_data
from app.dependencies.security import verify_api_key
from app.models.items import Property

router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


@router.post("/home-data", response_model=dict[str, list[Property]])
async def home_data(location: str):
    """Get home data from location."""
    return {"data": get_home_data(location)}
