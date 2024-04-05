"""Models for the application."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

# Max lengths (in characters)
MAX_EMAIL_LENGTH = 400
MAX_PHONE_NUMBER_LENGTH = 20
MAX_MESSAGE_LENGTH = 1000
MAX_FIRST_NAME_LENGTH = 700
MAX_LAST_NAME_LENGTH = 700


# Misc auth
class AuthCode(SQLModel, table=True):
    """Verification code model."""

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(default=None, max_length=MAX_EMAIL_LENGTH, index=True)
    code: str = Field(default_factory=lambda: uuid4().hex[:6])

    status: str = Field(default="pending", index=True)
    request_type: str = Field(default=None, index=True)
    request_date: datetime = Field(default_factory=datetime.utcnow)
    expire_date: datetime = Field(default=None)
    usage_date: datetime | None = Field(default=None)


class GoogleAuth(SQLModel):
    """Google auth model."""

    code: str | None = None
    state: str


# Link models
class ChatRequestBase(SQLModel):
    """Chat request link base model."""

    phone_number: str = Field(default=None, max_length=MAX_PHONE_NUMBER_LENGTH, index=True)
    content: str | None = Field(default=None, max_length=MAX_MESSAGE_LENGTH)


class ChatRequest(ChatRequestBase, table=True):
    """Chat request link model."""

    id: int | None = Field(default=None, primary_key=True)

    request_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending", index=True)

    requester_uuid: UUID = Field(default=None, foreign_key="user.uuid")
    receiver_uuid: UUID = Field(default=None, foreign_key="user.uuid")
    requester: "User" = Relationship(
        back_populates="requester_links",
        sa_relationship_kwargs={
            "foreign_keys": "ChatRequest.requester_uuid",
        },
    )
    receiver: "User" = Relationship(
        back_populates="receiver_links",
        sa_relationship_kwargs={
            "foreign_keys": "ChatRequest.receiver_uuid",
        },
    )


class ChatRequestCreate(ChatRequestBase):
    """Chat request link create model."""

    requester_uuid: UUID
    receiver_uuid: UUID


class ChatRequestRead(ChatRequestCreate):
    """Chat request link read model."""

    request_date: datetime
    status: str


class ChatRequestUpdate(SQLModel):
    """Chat request link update model."""

    phone_number: str | None = None
    content: str | None = None
    requester_uuid: UUID | None = None
    receiver_uuid: UUID | None = None


# User
class UserBase(SQLModel):
    """User base model."""

    join_date: datetime = Field(default_factory=datetime.utcnow)
    provider: str = Field(default="dilemma", index=True)

    profile_picture: str | None = None
    email: str = Field(default=None, max_length=MAX_EMAIL_LENGTH, index=True)
    first_name: str = Field(default=None, max_length=MAX_FIRST_NAME_LENGTH, index=True)
    last_name: str = Field(default=None, max_length=MAX_LAST_NAME_LENGTH, index=True)

    account_view: str = Field(default="profile")
    is_sidebar_open: bool = Field(default=True)

    disabled: bool = Field(default=False)


class User(UserBase, table=True):
    """User model."""

    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, unique=True)

    hashed_password: str | None = Field(default=None)
    refresh_token: str | None = Field(default=None)

    requester_links: list["ChatRequest"] = Relationship(
        back_populates="requester",
        sa_relationship_kwargs={
            "foreign_keys": "ChatRequest.requester_uuid",
            "lazy": "selectin",
            "cascade": "all, delete",
            "overlaps": "receiver_links",
        },
    )
    receiver_links: list["ChatRequest"] = Relationship(
        back_populates="receiver",
        sa_relationship_kwargs={
            "foreign_keys": "ChatRequest.receiver_uuid",
            "lazy": "selectin",
            "cascade": "all, delete",
            "overlaps": "requester_links",
        },
    )


class UserCreate(UserBase):
    """User create model."""

    password: str
    confirm_password: str | None = None
    code: str | None = None


class UserRead(UserBase):
    """User read model."""

    uuid: UUID
    requester_links: list[ChatRequestRead] = []
    receiver_links: list[ChatRequestRead] = []


class UserUpdate(SQLModel):
    """User update model."""

    code: str | None = None

    profile_picture: str | None = None
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    password: str | None = None
    confirm_password: str | None = None

    account_view: str | None = None
    is_sidebar_open: bool | None = None
