"""Feature routes."""

from fastapi import APIRouter, Security

from app.dependencies.items import search_arxiv_with_llm
from app.dependencies.security import verify_api_key
from app.models.items import Retrieve

router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


@router.post("/search/arxiv")
async def create_path(retrieve: Retrieve) -> dict[str, list]:
    """Endpoint for searching arXiv."""
    results = search_arxiv_with_llm(
        topic=retrieve.query,
    )
    return {"response": results}
