from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings for the API."""

    api_key: str = ""
    db_url: str = ""
    db_echo: bool = False
    openai_api_key: str = ""
    jwt_secret: str = ""
    smtp_ssl_host: str = ""
    smtp_ssl_port: int = 0
    smtp_ssl_sender: str = ""
    smtp_ssl_login: str = ""
    smtp_ssl_password: str = ""
    frontend_url: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()
