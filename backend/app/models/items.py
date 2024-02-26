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
