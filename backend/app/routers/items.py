"""Feature routes."""

import glob
import logging

from fastapi import APIRouter, Depends, Security
from sqlmodel import Session

from app.database import get_session
from app.dependencies.items import PropertiesFinder
from app.dependencies.security import verify_api_key
from app.models.items import Request, SearchResult, SearchResultRead

logger = logging.getLogger(__name__)


# Program
find_properties = PropertiesFinder()
try:
    model_path = max(glob.glob("models/*.json"))
    find_properties.load(model_path)
except Exception:
    logger.warning("Model loading failed.")


router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


@router.post("/property-data", response_model=SearchResultRead)
async def property_data(*, session: Session = Depends(get_session), request: Request):
    """Get property data from query."""
    pred = find_properties(request.query)
    search_result = SearchResult(
        location=pred.location,
        listing_type=pred.listing_type,
        radius=pred.radius,
        mls_only=pred.mls_only,
        past_days=pred.past_days,
        date_from=pred.date_from,
        date_to=pred.date_to,
        foreclosure=pred.foreclosure,
        properties=pred.properties,
    )
    session.add(search_result)
    session.commit()
    session.refresh(search_result)
    return SearchResultRead.model_validate(search_result)
