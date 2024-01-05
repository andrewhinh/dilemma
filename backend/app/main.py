"""Main application and routing logic for the API."""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_db_and_tables
from app.internal import admin
from app.routers import items, users

# Create database and tables
create_db_and_tables()

# Settings
SETTINGS = get_settings()

# App
app = FastAPI()
app.include_router(users.router)
app.include_router(items.router)
app.include_router(admin.router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[SETTINGS.frontend_url, SETTINGS.www_frontend_url],
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
        port=SETTINGS.api_port,
        reload=True,
        ssl_keyfile="./certificates/localhost+2-key.pem",
        ssl_certfile="./certificates/localhost+2.pem",
    )


if __name__ == "__main__":
    main()
