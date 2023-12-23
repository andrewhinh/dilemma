"""Models for the application."""
import uuid
from contextlib import suppress
from typing import Any, List, Optional

from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from langchain.callbacks.base import AsyncCallbackHandler
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel
from starlette.websockets import WebSocketState


# Items
class MessageResponse(BaseModel):
    """Response model for messages."""

    message: str


class StatusResponse(BaseModel):
    """Response model for status."""

    status: str


class ErrorResponse(StatusResponse):
    """Response model for errors."""

    error_message: str


class DoneResponse(StatusResponse):
    """Response model for done."""

    result: str


class WebSocketStreamingCallback(AsyncCallbackHandler):
    """Callback handler for streaming LLM responses."""

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def on_llm_new_token(self, token: str, **_: Any) -> None:
        """Run when LLM generates a new token."""
        with suppress(
            Exception
        ):  # Suppresses `Error in WebSocketStreamingCallback.on_llm_new_token callback: received 1000 (OK); then sent 1000 (OK)`
            if self.websocket.client_state == WebSocketState.CONNECTED:
                if token != "":
                    response = MessageResponse(message=token)
                    await self.websocket.send_json(jsonable_encoder(response))


# Teams and Users
class TeamBase(SQLModel):
    """Team base model."""

    name: str = Field(index=True)
    description: Optional[str] = Field(default=None, index=True)


class Team(TeamBase, table=True):
    """Team model."""

    id: Optional[int] = Field(default=None, primary_key=True)
    uid: Optional[str] = str(uuid.uuid4())
    users: List["User"] = Relationship(back_populates="team")


class TeamCreate(TeamBase):
    """Team create model."""

    pass


class TeamRead(TeamBase):
    """Team read model."""

    uid: str


class TeamReadWithUsers(TeamRead):
    """Team read with users model."""

    users: List["UserRead"] = []


class TeamUpdate(SQLModel):
    """Team update model."""

    name: Optional[str] = None
    description: Optional[str] = None


class UserBase(SQLModel):
    """User base model."""

    email: str = Field(index=True)
    username: Optional[str] = Field(default=None, index=True)
    fullname: Optional[str] = Field(default=None, index=True)
    disabled: Optional[bool] = False

    profile_view: Optional[str] = Field(default="user")
    is_sidebar_open: Optional[bool] = Field(default=True)
    team_role: Optional[str] = Field(default=None)

    recovery_code: Optional[str] = Field(default=None)


class User(UserBase, table=True):
    """User model."""

    id: Optional[int] = Field(default=None, primary_key=True)
    uid: Optional[str] = str(uuid.uuid4())

    hashed_password: str
    refresh_token: Optional[str] = Field(default=None)

    team_uid: Optional[str] = Field(default=None, foreign_key="team.uid")
    team: Optional["Team"] = Relationship(back_populates="users")


class UserCreate(UserBase):
    """User create model."""

    password: str
    confirm_password: Optional[str] = None


class UserRead(UserBase):
    """User read model."""

    uid: str


class UserReadWithTeam(UserRead):
    """User read with team model."""

    team: Optional["TeamRead"] = None


class UserUpdate(SQLModel):
    """User update model."""

    email: Optional[str] = None
    username: Optional[str] = None
    fullname: Optional[str] = None
    password: Optional[str] = None
    confirm_password: Optional[str] = None

    profile_view: Optional[str] = None
    is_sidebar_open: Optional[bool] = None

    recovery_code: Optional[str] = None


class Token(BaseModel):
    """Token model."""

    access_token: str
    token_type: str
    uid: str


# rebuild model because of circular import
TeamReadWithUsers.model_rebuild()
