"""Item models."""

from datetime import datetime

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
    comment: str | None
    journal_ref: str | None
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
    description: str | None
    forks_count: int
    full_name: str
    language: str | None
    open_issues_count: int
    pushed_at: datetime
    stargazers_count: int
    subscribers_count: int
    topics: list[str] | None
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
    publish_year: int | None
    publisher: str | None
    subtitle: str | None
    title: str
    url: str


class UdemyInstructor(SQLModel):
    """Udemy Instructor model."""

    display_name: str
    job_title: str
    url: str


class UdemyResponse(SQLModel):
    """Udemy Response model."""

    title: str
    url: str
    is_paid: bool
    price: str
    visible_instructors: list[UdemyInstructor]
    headline: str
