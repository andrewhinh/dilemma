"""Database engine and helper functions."""
from sqlmodel import Session, create_engine

from app.config import get_settings

SETTINGS = get_settings()
DB_URL = SETTINGS.db_url
engine = create_engine(DB_URL, echo=SETTINGS.db_echo)


def get_session():
    with Session(engine) as session:
        yield session
