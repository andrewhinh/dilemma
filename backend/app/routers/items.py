"""Feature routes."""

from fastapi import APIRouter, Security

from app.dependencies.items import (
    search_arxiv_with_llm,
    search_github_with_llm,
    search_wikipedia_with_llm,
)
from app.dependencies.security import verify_api_key
from app.models.items import ArXivResponse, GitHubResponse, Retrieve, WikipediaResponse

router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


@router.post("/search/arxiv")
async def search_arxiv(retrieve: Retrieve) -> dict[str, list[ArXivResponse | None]]:
    """Endpoint for searching arXiv."""
    results = search_arxiv_with_llm(
        topic=retrieve.query,
    )
    return {"response": results}


@router.post("/search/wikipedia")
async def search_wikipedia(retrieve: Retrieve) -> dict[str, WikipediaResponse | None]:
    """Endpoint for searching wikipedia."""
    result = search_wikipedia_with_llm(
        topic=retrieve.query,
    )
    return {"response": result}


@router.post("/search/github")
async def search_github(retrieve: Retrieve) -> dict[str, list[GitHubResponse | None]]:
    """Endpoint for searching github."""
    results = search_github_with_llm(
        topic=retrieve.query,
    )
    return {"response": results}
