"""Database engine and helper functions."""
from sqlmodel import Session, create_engine

from app.config import get_settings

SETTINGS = get_settings()
engine = create_engine(
    url=SETTINGS.database_uri,
    echo=SETTINGS.db_echo,
)


def get_session():
    with Session(engine) as session:
        yield session
