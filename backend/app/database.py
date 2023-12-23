"""Database engine and helper functions."""
from sqlmodel import Session, SQLModel, create_engine

from app.config import get_settings

SETTINGS = get_settings()
DB_URL = SETTINGS.db_url
engine = create_engine(DB_URL, echo=SETTINGS.echo)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
