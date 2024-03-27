"""Feature routes."""

from fastapi import APIRouter, Security

from app.dependencies.security import verify_api_key

router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)
