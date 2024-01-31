"""API key dependency."""
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from app.config import get_settings

SETTINGS = get_settings()
API_KEY = SETTINGS.api_key


async def verify_api_key(
    api_key_header: str = Security(APIKeyHeader(name="X-API-Key")),
) -> bool:
    """
    Verify API key.

    Parameters
    ----------
    api_key_header : str
        API key header

    Returns
    -------
    boolean
        True if API key is valid

    Raises
    ------
    HTTPException
        If API key is invalid
    """
    if api_key_header == API_KEY:
        return True
    raise HTTPException(status_code=401, detail="Could not validate credentials")
