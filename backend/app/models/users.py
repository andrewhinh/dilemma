"""Models for the application."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

# Max lengths (in characters)
MAX_EMAIL_LENGTH = 400
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
class ChatRequest(SQLModel, table=True):
    """Chat request link model."""

    id: int | None = Field(default=None, primary_key=True)

    request_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending")

    requester_uuid: UUID = Field(default=None, foreign_key="user.uuid")
    receiver_uuid: UUID = Field(default=None, foreign_key="user.uuid")
    requester: "User" = Relationship(back_populates="requester_links")
    receiver: "User" = Relationship(back_populates="receiver_links")


class UserChatLink(SQLModel, table=True):
    """User chat link model."""

    id: int | None = Field(default=None, primary_key=True)

    chat_uuid: UUID = Field(default=None, foreign_key="chat.uuid")
    user_uuid: UUID = Field(default=None, foreign_key="user.uuid")


# User
class UserBase(SQLModel):
    """User base model."""

    join_date: datetime = Field(default_factory=datetime.utcnow)
    provider: str = Field(default="dilemma", index=True)

    profile_picture: str | None = None
    email: str | None = Field(default=None, max_length=MAX_EMAIL_LENGTH, index=True)
    first_name: str | None = Field(default=None, max_length=MAX_FIRST_NAME_LENGTH)
    last_name: str | None = Field(default=None, max_length=MAX_LAST_NAME_LENGTH)

    account_view: str | None = Field(default="profile")
    is_sidebar_open: bool | None = Field(default=True)

    disabled: bool | None = Field(default=False)


class User(UserBase, table=True):
    """User model."""

    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, unique=True)

    hashed_password: str | None = Field(default=None)
    refresh_token: str | None = Field(default=None)

    requester_links: list["ChatRequest"] = Relationship(back_populates="requester")
    receiver_links: list["ChatRequest"] = Relationship(back_populates="receiver")

    chats: list["Chat"] = Relationship(back_populates="users", link_model=UserChatLink)


class UserCreate(UserBase):
    """User create model."""

    password: str
    confirm_password: str | None = None
    code: str | None = None


class UserRead(UserBase):
    """User read model."""

    uuid: UUID


class UserUpdate(SQLModel):
    """User update model."""

    code: str | None = None

    profile_picture: str | None = None
    email: str | None = None
    username: str | None = None
    fullname: str | None = None
    password: str | None = None
    confirm_password: str | None = None

    account_view: str | None = None
    is_sidebar_open: bool | None = None


# Messages
class MessageBase(SQLModel):
    """Message base model."""

    created: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active")
    content: str = Field(default="")


class Message(MessageBase, table=True):
    """Message model."""

    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, unique=True)

    chat_uuid: UUID = Field(default=None, foreign_key="chat.uuid")
    user_uuid: UUID = Field(default=None, foreign_key="user.uuid")


class MessageCreate(MessageBase):
    """Message create model."""

    content: str
    user_uuid: UUID
    chat_uuid: UUID


class MessageRead(MessageBase):
    """Message read model."""

    uuid: UUID
    user_uuid: UUID
    chat_uuid: UUID


class MessageUpdate(SQLModel):
    """Message update model."""

    content: str | None = None


# Chats
class ChatBase(SQLModel):
    """Chat base model."""

    created: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active")


class Chat(ChatBase, table=True):
    """Chat model."""

    id: int | None = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, unique=True)

    users: list["User"] = Relationship(back_populates="chats", link_model=UserChatLink)


class ChatCreate(ChatBase):
    """Chat create model."""

    user_uuids: list[UUID]


class ChatRead(ChatBase):
    """Chat read model."""

    uuid: UUID
    user_uuids: list[UUID]


class ChatUpdate(SQLModel):
    """Chat update model."""

    status: str | None = None
    user_uuids: list[UUID] | None = None
