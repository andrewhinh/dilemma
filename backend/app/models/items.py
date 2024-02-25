"""Item models."""

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel


# Retrieve model
class Retrieve(SQLModel):
    """Retrieve model."""

    query: str


# ArXiv Response model
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
