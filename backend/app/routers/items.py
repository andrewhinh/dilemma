"""Feature routes."""

import glob
import logging

from fastapi import APIRouter, Security

from app.dependencies.items import LocationReplacer, search_properties
from app.dependencies.security import verify_api_key
from app.models.items import SearchRequest, SearchResult

logger = logging.getLogger(__name__)


# Program
replace_location = LocationReplacer()
try:
    model_path = max(glob.glob("models/*.json"))
    replace_location.load(model_path)
except Exception:
    logger.warning("Model loading failed.")


router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


@router.post("/search/properties", response_model=SearchResult | list[str])
async def property_data(*, request: SearchRequest):
    """Get property data from query."""
    # replacements = replace_location(request.location).replacements
    # if replacements:
    #     return replacements

    return search_properties(request)
