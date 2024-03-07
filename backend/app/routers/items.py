"""Feature routes."""

from fastapi import APIRouter, Security

from app.dependencies.items import (
    create_path_from_search,
    get_top_paths,
    search_arxiv_with_llm,
    search_github_with_llm,
    search_open_library_with_llm,
    search_udemy_with_llm,
    search_wikipedia_with_llm,
    search_youtube_with_llm,
)
from app.dependencies.security import verify_api_key
from app.models.items import (
    ArXivResponse,
    GitHubResponse,
    OpenLibraryResponse,
    Retrieve,
    UdemyResponse,
    WikipediaResponse,
    YouTubeResponse,
)
from app.models.users import User

router = APIRouter(
    tags=["items"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


@router.post("/search/")
async def search(retrieve: Retrieve) -> dict[str, dict]:
    """Endpoint for searching all."""
    arxiv = await search_arxiv_with_llm(
        topic=retrieve.query,
    )
    github = await search_github_with_llm(
        topic=retrieve.query,
    )
    open_library = await search_open_library_with_llm(
        topic=retrieve.query,
    )
    udemy = await search_udemy_with_llm(
        topic=retrieve.query,
    )
    wikipedia = await search_wikipedia_with_llm(
        topic=retrieve.query,
    )
    youtube = await search_youtube_with_llm(
        topic=retrieve.query,
    )
    return {
        "response": {
            "arxiv": arxiv,
            "github": github,
            "open_library": open_library,
            "udemy": udemy,
            "wikipedia": wikipedia,
            "youtube": youtube,
        }
    }


@router.post("/search/arxiv")
async def search_arxiv(retrieve: Retrieve) -> dict[str, list[ArXivResponse]]:
    """Endpoint for searching arXiv."""
    results = search_arxiv_with_llm(
        topic=retrieve.query,
    )
    return {"response": results}


@router.post("/search/wikipedia")
async def search_wikipedia(retrieve: Retrieve) -> dict[str, WikipediaResponse]:
    """Endpoint for searching wikipedia."""
    result = search_wikipedia_with_llm(
        topic=retrieve.query,
    )
    return {"response": result}


@router.post("/search/github")
async def search_github(retrieve: Retrieve) -> dict[str, list[GitHubResponse]]:
    """Endpoint for searching github."""
    results = search_github_with_llm(
        topic=retrieve.query,
    )
    return {"response": results}


@router.post("/search/youtube")
async def search_youtube(retrieve: Retrieve) -> dict[str, list[YouTubeResponse]]:
    """Endpoint for searching youtube."""
    result = search_youtube_with_llm(
        topic=retrieve.query,
    )
    return {"response": result}


@router.post("/search/open-library")
async def search_open_library(retrieve: Retrieve) -> dict[str, OpenLibraryResponse]:
    """Endpoint for searching open library."""
    result = search_open_library_with_llm(
        topic=retrieve.query,
    )
    return {"response": result}


@router.post("/search/udemy")
async def search_udemy(retrieve: Retrieve) -> dict[str, list[UdemyResponse]]:
    """Endpoint for searching udemy."""
    result = search_udemy_with_llm(
        topic=retrieve.query,
    )
    return {"response": result}


@router.post("/create/path")
async def create_path(retrieve: Retrieve) -> dict[str, list]:
    """Endpoint for creating path."""
    search_results = await search(retrieve)
    path = create_path_from_search(search_results["response"])
    return {"response": path}


@router.get("/paths")
async def get_paths(user: User | None) -> dict[str, list[str]]:
    """Endpoint for getting paths."""
    paths = get_top_paths(user)
    return {"response": paths}
