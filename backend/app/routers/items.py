"""Feature routes."""

import glob
import logging

from fastapi import APIRouter, Security

from app.dependencies.items import HomesFinder
from app.dependencies.security import verify_api_key
from app.models.items import Property, Request

logger = logging.getLogger(__name__)


# Program
find_homes = HomesFinder()
try:
    model_path = max(glob.glob("models/*.json"))
    find_homes.load(model_path)
except Exception:
    logger.warning("Model loading failed.")


router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


@router.post("/home-data", response_model=dict[str, str | float | bool | list[Property] | None])
async def home_data(request: Request):
    """Get home data from query."""
    pred = find_homes(request.query)
    return {
        "location": pred.location,
        "listing_type": pred.listing_type,
        "radius": pred.radius,
        "mls_only": pred.mls_only,
        "past_days": pred.past_days,
        "date_from": pred.date_from,
        "date_to": pred.date_to,
        "foreclosure": pred.foreclosure,
        "homes": pred.homes,
    }
