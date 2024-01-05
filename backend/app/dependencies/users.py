"""Dependencies for user endpoints."""
from datetime import datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.config import get_settings
from app.database import get_session
from app.models import User

SETTINGS = get_settings()
JWT_SECRET = SETTINGS.jwt_secret
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
REFRESH_TOKEN_EXPIRES = timedelta(days=30)

PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl="/token")


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


def set_cookie(refresh_token: str, response: Response):
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


def create_access_token(data: dict, expires_delta: timedelta) -> str:
    """
    Create access token.

    Parameters
    ----------
    data : dict
        Data
    expires_delta : timedelta | None, optional
        Expiration delta, by default None

    Returns
    -------
    str
        Access token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def get_user_from_token(token: str, session: Session) -> User:
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
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception from None
    db_user = get_user(session, email)
    if db_user is None:
        raise credentials_exception
    return db_user


async def get_current_user(
    *,
    session: Session = Depends(get_session),
    token: Annotated[str, Depends(OAUTH2_SCHEME)],
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
    return get_user_from_token(token, session)


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
