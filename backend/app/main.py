"""Main application and routing logic for the API."""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.dependencies.users import WWW_URL
from app.internal import admin
from app.routers import items, users

# Settings
SETTINGS = get_settings()
FRONTEND_URL = SETTINGS.frontend_url

# App
app = FastAPI()
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(items.router)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, WWW_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Paths
@app.get("/")
async def read_root() -> dict[str, str]:
    """Read root.

    Returns
    -------
    dict[str, str]
        Message
    """
    return {"message": "API"}


def main():
    """Run API."""
    uvicorn.run(
        "app.main:app",
        reload=True,
        ssl_keyfile="./certificates/localhost+2-key.pem",
        ssl_certfile="./certificates/localhost+2.pem",
    )


if __name__ == "__main__":
    main()
