"""Dependencies for user endpoints."""
import smtplib
import uuid
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Annotated, List, Optional

import requests
from fastapi import Cookie, Depends, HTTPException, Response
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from markdown import markdown
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.config import get_settings
from app.database import get_session
from app.models.users import Friend, FriendRequest, User, VerificationCode

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

GOOGLE_CLIENT_ID = SETTINGS.google_client_id
GOOGLE_CLIENT_SECRET = SETTINGS.google_client_secret
GOOGLE_REDIRECT_URI = SETTINGS.google_redirect_uri

FRONTEND_URL = SETTINGS.frontend_url
DOMAIN = FRONTEND_URL.split("//")[1].split(":")[0]  # : is for port in case of localhost
WWW_URL = FRONTEND_URL
if DOMAIN != "localhost":
    WWW_URL = FRONTEND_URL.split("//")[0] + "//www." + FRONTEND_URL.split("//")[1]

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=401,
    detail="Could not validate credentials",
)


def get_user(session: Session, provider: str = None, email: str = None, username: str = None) -> User | None:
    """
    Get user.

    Parameters
    ----------
    session : Session
        Session
    provider : str
        Provider
    email : str
        Email
    username : str
        Username

    Returns
    -------
    User | None
        User if exists, else None
    """
    statement = select(User)
    if provider:
        statement = statement.where(User.provider == provider)

    if email:
        return session.exec(statement.where(User.email == email)).first()
    elif username:
        return session.exec(statement.where(User.username == username)).first()
    else:
        return None


def send_email(email: str, subject: str, body: str) -> None:
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


def get_google_auth_url(state: str) -> str:
    """
    Get Google auth URL.

    Parameters
    ----------
    state : str
        Auth type

    Returns
    -------
    str
        Google auth URL
    """
    return f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20profile%20email&access_type=offline&state={state}"


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


def create_token(data: dict, expires_delta: timedelta) -> str:
    """
    Create token.

    Parameters
    ----------
    data : dict
        Data
    expires_delta : timedelta
        Expiration delta

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


def generate_username_from_email(session: Session, email: str) -> str:
    """
    Generate username from email.

    Parameters
    ----------
    session : Session
        Session
    email : str
        Email

    Returns
    -------
    str
        Username
    """
    base = email.split("@")[0]
    username = base
    while get_user(session, username=username):
        unique_suffix = uuid.uuid4().hex[:4]
        username = f"{base}_{unique_suffix}"
    return username


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


def set_auth_cookies(response: Response, access_token: str, refresh_token: str, provider: str) -> None:
    """
    Set auth cookies.

    Parameters
    ----------
    response : Response
        Response
    access_token : str
        Access token
    refresh_token : str
        Refresh token
    provider : str
        Provider

    Returns
    -------
    Response
        Response

    Raises
    ------
    HTTPException
        If provider is invalid
    """
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
    response.set_cookie(
        key="provider",
        value=provider,
        max_age=REFRESH_TOKEN_EXPIRES.total_seconds(),
        secure=True,
        httponly=True,
        samesite="none",
    )


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


def google_get_tokens(data: dict) -> dict[str, str]:
    """
    Get tokens from Google.

    Parameters
    ----------
    data : dict
        Data

    Returns
    -------
    dict[str, str]
        Tokens
    """
    response = requests.post(
        "https://www.googleapis.com/oauth2/v4/token",
        data=data,
    )
    result = response.json()
    access_token = result.get("access_token")
    refresh_token = result.get("refresh_token")
    if not access_token:
        raise CREDENTIALS_EXCEPTION
    return {"access_token": access_token, "refresh_token": refresh_token}


def google_get_tokens_from_code(code: str) -> dict[str, str]:
    """
    Get tokens from Google code.

    Parameters
    ----------
    code : str
        Code

    Returns
    -------
    dict[str, str]
        Tokens
    """
    return google_get_tokens(
        {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
    )


def google_encode_refresh_token(refresh_token: str) -> str:
    """
    Encode refresh token.

    Parameters
    ----------
    refresh_token : str
        Refresh token

    Returns
    -------
    str
        Encoded refresh token
    """
    return jwt.encode({"refresh_token": refresh_token}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def google_get_user_info_from_access_token(access_token: str) -> dict[str, str]:
    """
    Get user info from Google access token.

    Parameters
    ----------
    access_token : str
        Access token

    Raises
    ------
    credentials_exception
        If credentials are invalid

    Returns
    -------
    dict[str, str]
        User info
    """
    try:
        response = requests.get(
            "https://www.googleapis.com/oauth2/v1/userinfo", headers={"Authorization": f"Bearer {access_token}"}
        )
        return response.json()
    except Exception:
        raise CREDENTIALS_EXCEPTION from None


def google_get_user_from_user_info(session: Session, user_info: dict) -> User:
    """
    Get user from Google access token.

    Parameters
    ----------
    session : Session
        Session
    token : str
        Token

    Raises
    ------
    credentials_exception
        If credentials are invalid

    Returns
    -------
    user
        User
    """
    provider = "google"
    email = user_info.get("email")
    return get_user(session, provider, email)


def set_redirect_fe(response: RedirectResponse, route: str) -> RedirectResponse:
    response = RedirectResponse(url=f"{FRONTEND_URL}{route}")
    return response


def google_decode_refresh_token(refresh_token: str) -> str:
    """
    Decode refresh token.

    Parameters
    ----------
    refresh_token : str
        Refresh token

    Returns
    -------
    str
        Decoded refresh token
    """
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("refresh_token")
    except JWTError:
        raise CREDENTIALS_EXCEPTION from None


def google_get_new_access_token(refresh_token: str) -> dict[str, str]:
    """
    Get tokens from Google refresh token.

    Parameters
    ----------
    refresh_token : str
        Refresh token

    Returns
    -------
    dict[str, str]
        Tokens
    """
    return google_get_tokens(
        {
            "refresh_token": refresh_token,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "grant_type": "refresh_token",
        },
    )["access_token"]


def get_user_from_token(session: Session, provider: str, token: str) -> User:
    """
    Verify token.

    Parameters
    ----------
    session : Session
        Session
    provider : str
        Provider
    token : str
        Token

    Raises
    ------
    credentials_exception
        If credentials are invalid

    Returns
    -------
    User
        User
    """
    if provider == "dilemma":
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            email: str = payload.get("email")
            if email is None:
                raise CREDENTIALS_EXCEPTION
        except JWTError:
            raise CREDENTIALS_EXCEPTION from None
    elif provider == "google":
        # Check if token is access token or refresh token
        try:
            user_info = google_get_user_info_from_access_token(token)
            email = user_info.get("email")
        except HTTPException:  # token is refresh token
            dec_refresh_token = google_decode_refresh_token(token)
            access_token = google_get_new_access_token(dec_refresh_token)
            user_info = google_get_user_info_from_access_token(access_token)
            email = user_info.get("email")
    else:
        raise CREDENTIALS_EXCEPTION

    db_user = get_user(session, provider, email)
    if db_user is None:
        raise CREDENTIALS_EXCEPTION
    return db_user


def delete_auth_cookies(response: Response) -> None:
    """
    Delete auth cookies.

    Parameters
    ----------
    response : Response
        Response
    """
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    response.delete_cookie(key="provider")


async def get_current_user(
    *,
    session: Session = Depends(get_session),
    access_token: Optional[str] = Cookie(default=None),
    provider: Optional[str] = Cookie(default=None),
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
    if not access_token or not provider:
        raise CREDENTIALS_EXCEPTION
    return get_user_from_token(session, provider, access_token)


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
