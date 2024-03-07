"""Item models."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import JSON, Column, Field, SQLModel

# Max lengths (in characters)
MAX_QUERY_LENGTH = 100
MAX_DESCRIPTION_LENGTH = 1000


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

    images: list[str]
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


# Path
class PathBase(SQLModel):
    """Path base model."""

    title: str = Field(default=None, max_length=MAX_QUERY_LENGTH)
    description: str | None = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)
    author: str = Field(default=None)
    created: datetime = Field(default_factory=datetime.utcnow)
    items: list[str] = Field(default=None, sa_column=Column(JSON))
    likes: int = Field(default=None)
    dislikes: int = Field(default=None)
    comments: list[str] = Field(default=None, sa_column=Column(JSON))

    # Needed for Column(JSON)
    class Config:
        """Configuration for PathBase class."""

        arbitrary_types_allowed = True


class Path(PathBase, table=True):
    """Path model."""

    id: int | None = Field(default=None, primary_key=True)
    uid: UUID = Field(default_factory=lambda: uuid4(), unique=True)


class PathCreate(PathBase):
    """Path create model."""

    pass


class PathRead(PathBase):
    """Path read model."""

    uid: UUID


class PathUpdate(SQLModel):
    """Path update model."""

    title: str | None = None
    description: str | None = None
    items: list | None = None
    likes: int | None = None
    dislikes: int | None = None
    comments: list | None = None
