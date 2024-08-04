"""Feature routes."""

import glob
import logging

from fastapi import APIRouter, Depends, Security
from sqlmodel import Session

from app.database import get_session
from app.dependencies.items import LocationReplacer, search_properties
from app.dependencies.security import verify_api_key
from app.models.items import SearchRequest, SearchResultRead

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


@router.post("/search/properties", response_model=SearchResultRead | list[str])
async def property_data(*, session: Session = Depends(get_session), request: SearchRequest):
    """Get property data from query."""
    # replacements = replace_location(request.location).replacements
    # if replacements:
    #     return replacements

    search_result = search_properties(session, request)
    return SearchResultRead.model_validate(search_result)
