import secrets
from functools import lru_cache
from typing import Any

from pydantic import PostgresDsn, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings for the API."""

    api_key: str = secrets.token_urlsafe(32)

    db_echo: bool = False
    postgres_server: str = ""
    postgres_user: str = ""
    postgres_password: str = ""
    postgres_db: str = ""
    database_uri: str | None = None

    @validator("database_uri", pre=True)
    def assemble_db_connection(cls, v: str | None, values: dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return str(
            PostgresDsn.build(
                scheme="postgresql+psycopg2",
                username=values.get("postgres_user"),
                password=values.get("postgres_password"),
                host=values.get("postgres_server"),
                path=values.get("postgres_db"),
            )
        )

    jwt_secret: str = secrets.token_urlsafe(32)
    access_token_expire_minutes: int = 0
    refresh_token_expire_minutes: int = 0
    verify_code_expire_minutes: int = 0
    recovery_code_expire_minutes: int = 0

    smtp_ssl_host: str = ""
    smtp_ssl_port: int = 0
    smtp_ssl_sender: str = ""
    smtp_ssl_login: str = ""
    smtp_ssl_password: str = ""

    frontend_url: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""

    openai_api_key: str = ""
    github_username: str = ""
    github_password: str = ""
    youtube_api_key: str = ""
    open_library_access_key: str = ""
    open_library_secret_key: str = ""
    udemy_client_id: str = ""
    udemy_client_secret: str = ""

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()
