"""Dependencies for user endpoints."""
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Annotated, List, Optional

from fastapi import Cookie, Depends, HTTPException, Response
from jose import JWTError, jwt
from markdown import markdown
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.config import get_settings
from app.database import get_session
from app.models import Friend, FriendRequest, User, VerificationCode

SETTINGS = get_settings()

SMTP_SSL_HOST = SETTINGS.smtp_ssl_host
SMTP_SSL_PORT = SETTINGS.smtp_ssl_port
SMTP_SSL_SENDER = SETTINGS.smtp_ssl_sender
SMTP_SSL_LOGIN = SETTINGS.smtp_ssl_login
SMTP_SSL_PASSWORD = SETTINGS.smtp_ssl_password

JWT_SECRET = SETTINGS.jwt_secret
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
REFRESH_TOKEN_EXPIRES = timedelta(days=30)
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")


def send_email(email: str, subject: str, body: str):
    """
    Send email.

    Parameters
    ----------
    email : str
        Email
    subject : str
        Subject
    body : str
        Body
    """
    with smtplib.SMTP(SMTP_SSL_HOST, SMTP_SSL_PORT) as s:
        s.ehlo()
        s.starttls()
        s.ehlo()
        s.login(SMTP_SSL_LOGIN, SMTP_SSL_PASSWORD)

        msg = MIMEMultipart("alternative")
        msg["From"] = formataddr((SMTP_SSL_SENDER, SMTP_SSL_LOGIN))
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        msg.attach(MIMEText(markdown(body), "html"))
        s.send_message(msg)


def get_verification_code(session: Session, email: str, status: str = "pending") -> VerificationCode | None:
    """
    Get verification code.

    Parameters
    ----------
    session : Session
        Session
    email : str
        Email
    status : str
        Status

    Returns
    -------
    VerificationCode
        Verification code
    """
    return session.exec(
        select(VerificationCode).where(VerificationCode.email == email).where(VerificationCode.status == status)
    ).first()


def get_password_hash(password: str) -> str:
    """
    Get password hash.

    Parameters
    ----------
    password : str
        Password

    Returns
    -------
    str
        Hashed password
    """
    return PWD_CONTEXT.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password.

    Parameters
    ----------
    plain_password: str
        Plain text password
    hashed_password: str
        Hashed password

    Returns
    -------
    bool
        True if password is verified, else False
    """
    return PWD_CONTEXT.verify(plain_password, hashed_password)


def set_auth_cookies(access_token: str, refresh_token: str, response: Response):
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRES.total_seconds(),
        secure=True,
        httponly=True,
        samesite="none",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRES.total_seconds(),
        secure=True,
        httponly=True,
        samesite="none",
    )


def get_user(session: Session, email: str = None, username: str = None) -> User | None:
    """
    Get user.

    Parameters
    ----------
    session : Session
        Session
    email : str
        Email
    username : str
        Username

    Returns
    -------
    User | None
        User if exists, else None
    """
    if email:
        return session.exec(select(User).where(User.email == email)).first()
    if username:
        return session.exec(select(User).where(User.username == username)).first()
    return None


def authenticate_user(email: str, password: str, hashed_password: str, session: Session) -> User | None:
    """
    Authenticate user.

    Parameters
    ----------
    email : str
        Email
    password : str
        Password
    hashed_password : str
        Hashed password
    session : Session
        Session

    Returns
    -------
    User | None
        User if authenticated, else None
    """
    user = get_user(session, email)
    if not user:
        return False
    if not verify_password(password, hashed_password):
        return False
    return user


def create_token(data: dict, expires_delta: timedelta) -> str:
    """
    Create token.

    Parameters
    ----------
    data : dict
        Data
    expires_delta : timedelta | None, optional
        Expiration delta, by default None

    Returns
    -------
    str
        token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def get_user_from_token(token: Optional[str], session: Session) -> User:
    """
    Verify token.

    Parameters
    ----------
    token : str
        Token
    session : Session
        Session

    Raises
    ------
    credentials_exception
        If credentials are invalid

    Returns
    -------
    User
        User
    """
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
    )
    if token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception from None
    db_user = get_user(session, email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


async def get_current_user(
    *,
    session: Session = Depends(get_session),
    access_token: Optional[str] = Cookie(default=None),
) -> User:
    """
    Get current user.

    Parameters
    ----------
    session : Session, optional
        Session, by default Depends(get_session)
    token : str
        Token

    Returns
    -------
    User
        Current user
    """
    return get_user_from_token(access_token, session)


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Get current active user.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    User
        Current active user

    Raises
    ------
    HTTPException
        If user is inactive
    """
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_sent_friend_request_links(current_user: User) -> List[FriendRequest]:
    """
    Get sent friend request links.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    List[FriendRequest]
        Sent friend request links
    """
    return [link for link in current_user.sender_links if link.status == "pending"]


def get_sent_friend_requests(current_user: User, status: str = "pending") -> List[User]:
    """
    Get sent friend requests.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    List[User]
        Sent friend requests
    """
    return [link.receiver for link in current_user.sender_links if link.status == status]


def get_incoming_friend_request_links(current_user: User) -> List[FriendRequest]:
    """
    Get incoming friend request links.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    List[FriendRequest]
        Incoming friend request links
    """
    return [link for link in current_user.receiver_links if link.status == "pending"]


def get_incoming_friend_requests(current_user: User, status: str = "pending") -> List[User]:
    """
    Get incoming friend requests.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    List[User]
        Incoming friend requests
    """
    return [link.sender for link in current_user.receiver_links if link.status == status]


def get_friend_links(current_user: User) -> List[Friend]:
    """
    Get friends links.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    List[Friend]
        Friend links
    """
    return [link for link in current_user.friend_1_links if link.status == "confirmed"] + [
        link for link in current_user.friend_2_links if link.status == "confirmed"
    ]


def get_friends(current_user: User, status: str = "confirmed") -> List[User]:
    """
    Get friends.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    List[User]
        Friends
    """
    return [link.friend_1 for link in current_user.friend_1_links if link.status == status] + [
        link.friend_2 for link in current_user.friend_2_links if link.status == status
    ]
