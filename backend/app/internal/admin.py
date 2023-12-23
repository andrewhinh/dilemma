"""Admin module."""
from fastapi import APIRouter

router = APIRouter(
    tags=["admin"],
    prefix="/admin",
    responses={404: {"description": "Not found"}},
)


@router.post("/")
async def update_admin() -> dict[str, str]:
    """Update admin.

    Returns
    -------
    dict[str, str]
        Message
    """
    return {"message": "Admin"}
