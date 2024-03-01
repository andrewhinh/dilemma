"""Item models."""

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel


# Retrieve model
class Retrieve(SQLModel):
    """Retrieve model."""

    query: str


# Response models
class ArXivResponse(SQLModel):
    """ArXiv Response model."""

    entry_id: str
    updated: datetime
    published: datetime
    title: str
    authors: list[str]
    summary: str
    comment: Optional[str]
    journal_ref: Optional[str]
    primary_category: str
    categories: list[str]


class WikipediaResponse(SQLModel):
    """Wikipedia Response model."""

    categories: list[str]
    images: list[str]
    links: list[str]
    references: list[str]
    summary: str
    title: str
    url: str


class GitHubResponse(SQLModel):
    """GitHub Response model."""

    created_at: datetime
    description: Optional[str]
    forks_count: int
    full_name: str
    language: Optional[str]
    open_issues_count: int
    pushed_at: datetime
    stargazers_count: int
    subscribers_count: int
    topics: Optional[list[str]]
    updated_at: datetime
    url: str


class YouTubeResponse(SQLModel):
    """YouTube Response model."""

    kind: str
    title: str
    description: str
    publishedAt: datetime
    url: str


class OpenLibraryAuthor(SQLModel):
    """OpenLibrary Author model."""

    name: str
    olid: str  # id


class OpenLibraryResponse(SQLModel):
    """OpenLibrary Response model."""

    authors: list[OpenLibraryAuthor]
    olid: str  # id
    publish_year: Optional[int]
    publisher: Optional[str]
    subtitle: Optional[str]
    title: str
    url: str
