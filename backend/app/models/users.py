"""Models for the application."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


# Misc auth
class AuthCode(SQLModel, table=True):
    """Verification code model."""

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(default=None, index=True)
    code: str = Field(default_factory=lambda: uuid4().hex[:6])

    status: str = Field(default="pending", index=True)
    request_type: str = Field(default=None, index=True)
    request_date: datetime = Field(default_factory=datetime.utcnow)
    expire_date: datetime = Field(default=None)
    usage_date: Optional[datetime] = Field(default=None)


class GoogleAuth(SQLModel):
    """Google auth model."""

    code: Optional[str] = None
    state: str


# User
class UserBase(SQLModel):
    """User base model."""

    join_date: datetime = Field(default_factory=datetime.utcnow)
    provider: str = Field(default="dilemma", index=True)

    profile_picture: Optional[str] = Field(default=None)
    email: Optional[str] = Field(default=None, index=True)
    username: Optional[str] = Field(default=None, index=True)
    fullname: Optional[str] = Field(default=None)
    disabled: Optional[bool] = False

    account_view: Optional[str] = Field(default="profile")
    is_sidebar_open: Optional[bool] = Field(default=True)


class User(UserBase, table=True):
    """User model."""

    id: Optional[int] = Field(default=None, primary_key=True)
    uid: UUID = Field(default_factory=lambda: uuid4(), unique=True)

    hashed_password: Optional[str] = Field(default=None)
    refresh_token: Optional[str] = Field(default=None)

    sender_links: Optional[List["FriendRequest"]] = Relationship(
        back_populates="sender",
        sa_relationship_kwargs={
            "foreign_keys": "FriendRequest.user_uid",
            "lazy": "selectin",
            "cascade": "all, delete",
        },
    )
    receiver_links: Optional[List["FriendRequest"]] = Relationship(
        back_populates="receiver",
        sa_relationship_kwargs={
            "foreign_keys": "FriendRequest.friend_uid",
            "lazy": "selectin",
            "cascade": "all, delete",
        },
    )

    friend_1_links: Optional[List["Friend"]] = Relationship(
        back_populates="friend_1",
        sa_relationship_kwargs={
            "foreign_keys": "Friend.user_uid",
            "lazy": "selectin",
            "cascade": "all, delete",
        },
    )
    friend_2_links: Optional[List["Friend"]] = Relationship(
        back_populates="friend_2",
        sa_relationship_kwargs={
            "foreign_keys": "Friend.friend_uid",
            "lazy": "selectin",
            "cascade": "all, delete",
        },
    )


class UserReference(UserBase):
    """Model for referencing a user."""

    username: str


class UserCreate(UserBase):
    """User create model."""

    password: str
    confirm_password: Optional[str] = None
    code: Optional[str] = None


class UserRead(UserBase):
    """User read model."""

    uid: UUID


class UserUpdate(SQLModel):
    """User update model."""

    code: Optional[str] = None

    profile_picture: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    fullname: Optional[str] = None
    password: Optional[str] = None
    confirm_password: Optional[str] = None

    account_view: Optional[str] = None
    is_sidebar_open: Optional[bool] = None


# Friends
class FriendRequest(SQLModel, table=True):
    """Friend request link model."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_uid: UUID = Field(default=None, foreign_key="user.uid")
    friend_uid: UUID = Field(default=None, foreign_key="user.uid")

    request_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending")
    sender: User = Relationship(
        back_populates="sender_links",
        sa_relationship_kwargs={
            "foreign_keys": "FriendRequest.user_uid",
        },
    )
    receiver: User = Relationship(
        back_populates="receiver_links",
        sa_relationship_kwargs={
            "foreign_keys": "FriendRequest.friend_uid",
        },
    )


class Friend(SQLModel, table=True):
    """Friend link model."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_uid: UUID = Field(default=None, foreign_key="user.uid")
    friend_uid: UUID = Field(default=None, foreign_key="user.uid")

    friendship_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="confirmed")
    friend_1: User = Relationship(
        back_populates="friend_1_links",
        sa_relationship_kwargs={
            "foreign_keys": "Friend.friend_uid",
        },
    )
    friend_2: User = Relationship(
        back_populates="friend_2_links",
        sa_relationship_kwargs={
            "foreign_keys": "Friend.user_uid",
        },
    )


class FriendReadBase(BaseModel):
    """Friend read base model."""

    uid: UUID
    join_date: datetime
    profile_picture: Optional[str]
    username: str


class FriendRequestRead(FriendReadBase):
    """Friend request read model."""

    request_date: datetime


class FriendRead(FriendReadBase):
    """Friend read model."""

    friendship_date: datetime
