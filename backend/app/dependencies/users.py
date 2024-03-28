"""Dependencies for user endpoints."""

import smtplib
import uuid
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Annotated

import requests
from fastapi import Cookie, Depends, HTTPException, Response
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from markdown import markdown
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.config import get_settings
from app.database import get_session
from app.models.users import AuthCode, Friend, FriendRequest, User

SETTINGS = get_settings()

SMTP_SSL_HOST = SETTINGS.smtp_ssl_host
SMTP_SSL_PORT = SETTINGS.smtp_ssl_port
SMTP_SSL_SENDER = SETTINGS.smtp_ssl_sender
SMTP_SSL_LOGIN = SETTINGS.smtp_ssl_login
SMTP_SSL_PASSWORD = SETTINGS.smtp_ssl_password

JWT_SECRET = SETTINGS.jwt_secret
ACCESS_TOKEN_EXPIRES = timedelta(minutes=SETTINGS.access_token_expire_minutes)
REFRESH_TOKEN_EXPIRES = timedelta(minutes=SETTINGS.refresh_token_expire_minutes)
VERIFY_CODE_EXPIRES = timedelta(minutes=SETTINGS.verify_code_expire_minutes)
RECOVERY_CODE_EXPIRES = timedelta(minutes=SETTINGS.recovery_code_expire_minutes)
JWT_ALGORITHM = "HS256"
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


def get_user(
    session: Session, disabled: bool = None, provider: str = None, email: str = None, username: str = None
) -> User | None:
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

    if disabled is not None:
        statement = statement.where(User.disabled == disabled)

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


def get_auth_code(session: Session, email: str, request_type: str, status: str = "pending") -> AuthCode | None:
    """
    Get auth code.

    Parameters
    ----------
    session : Session
        Session
    email : str
        Email
    request_type : str
        Request type
    status : str
        Status

    Returns
    -------
    AuthCode
        Auth code
    """
    return session.exec(
        select(AuthCode)
        .where(AuthCode.email == email)
        .where(AuthCode.request_type == request_type)
        .where(AuthCode.status == status)
    ).all()[-1]


def verify_code(session: Session, code: str, email: str, request_type: str) -> bool:
    """
    Check if code is valid.

    Parameters
    ----------
    session : Session
        Session
    code : str
        Code
    email : str
        Email

    Returns
    -------
    bool
        True if code is valid, else False
    """
    if not code:
        raise HTTPException(
            status_code=400,
            detail="Code is empty",
        )

    db_verify_code = get_auth_code(session, email, request_type)
    now = datetime.utcnow()

    if not db_verify_code or not db_verify_code.code:
        raise HTTPException(
            status_code=404,
            detail="Previous code not found, request new code",
        )
    if code != db_verify_code.code or db_verify_code.status == "verified":
        raise HTTPException(
            status_code=400,
            detail="Code is invalid",
        )
    if db_verify_code.expire_date < now or db_verify_code.status == "expired":
        if db_verify_code.status != "expired":
            db_verify_code.status = "expired"
            session.add(db_verify_code)
            session.commit()
        raise HTTPException(
            status_code=400,
            detail="Code is expired, request new code",
        )

    db_verify_code.status = "verified"
    db_verify_code.usage_date = now
    session.add(db_verify_code)
    session.commit()
    return True


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


def set_auth_cookies(
    response: Response, access_token: str = None, refresh_token: str = None, provider: str = None
) -> None:
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
    if access_token:
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRES.total_seconds(),
            secure=True,
            httponly=True,
            samesite="none",
        )
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=REFRESH_TOKEN_EXPIRES.total_seconds(),
            secure=True,
            httponly=True,
            samesite="none",
        )
    if provider:
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


def google_get_user_from_user_info(
    session: Session,
    user_info: dict,
    disabled: bool = None,
) -> User:
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
    if disabled is not None:
        return get_user(session, disabled=disabled, provider=provider, email=email)
    return get_user(session, provider=provider, email=email)


def set_redirect_fe(response: RedirectResponse, route: str) -> RedirectResponse:
    """
    Set redirect frontend.

    Parameters
    ----------
    response : RedirectResponse
        Response
    route : str
        Route

    Returns
    -------
    RedirectResponse
        Response
    """
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
            if email is None:
                raise CREDENTIALS_EXCEPTION
        except HTTPException:  # token is refresh token
            dec_refresh_token = google_decode_refresh_token(token)
            access_token = google_get_new_access_token(dec_refresh_token)
            user_info = google_get_user_info_from_access_token(access_token)
            email = user_info.get("email")
    else:
        raise CREDENTIALS_EXCEPTION

    db_user = get_user(session, disabled=False, provider=provider, email=email)
    if db_user is None:
        raise CREDENTIALS_EXCEPTION
    return db_user


def delete_auth_cookies(response: Response, cookies: list[str] = None) -> None:
    """
    Delete auth cookies.

    Parameters
    ----------
    response : Response
        Response
    """
    if cookies is None:
        cookies = ["access_token", "refresh_token", "provider"]
    for cookie in cookies:
        response.delete_cookie(key=cookie)


async def get_current_user(
    *,
    session: Session = Depends(get_session),
    access_token: str | None = Cookie(default=None),
    provider: str | None = Cookie(default=None),
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


def verify_user_update(session: Session, current_user: User, user_data: dict):
    """
    Verify user update data.

    Parameters
    ----------
    session : Session
        Session
    current_user : User
        Current user
    user_data : dict
        User data

    Returns
    -------
    bool
        True if username changed, else False
    """
    if "email" in user_data.keys():
        raise HTTPException(
            status_code=400,
            detail="Email cannot be updated",
        )

    if "username" in user_data.keys():
        if not user_data["username"]:
            raise HTTPException(
                status_code=400,
                detail="Username is empty",
            )
        if current_user.username != user_data["username"]:
            if get_user(session, username=user_data["username"]):
                raise HTTPException(
                    status_code=400,
                    detail="Username is invalid",
                )

    if "password" in user_data.keys() and "confirm_password" in user_data.keys():
        if not user_data["password"]:
            raise HTTPException(
                status_code=400,
                detail="Password is empty",
            )
        if not user_data["confirm_password"]:
            raise HTTPException(
                status_code=400,
                detail="Confirm password is empty",
            )
        if user_data["password"] != user_data["confirm_password"]:
            raise HTTPException(
                status_code=400,
                detail="Passwords do not match",
            )
        user_data["hashed_password"] = get_password_hash(user_data["password"])
        del user_data["password"]
        del user_data["confirm_password"]


def get_sent_friend_request_links(current_user: User, status: str = "pending") -> list[FriendRequest]:
    """
    Get sent friend request links.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    list[FriendRequest]
        Sent friend request links
    """
    return [link for link in current_user.sender_links if link.status == status]


def get_sent_friend_requests(current_user: User, status: str = "pending") -> list[User]:
    """
    Get sent friend requests.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    list[User]
        Sent friend requests
    """
    return [link.receiver for link in current_user.sender_links if link.status == status]


def get_incoming_friend_request_links(current_user: User, status: str = "pending") -> list[FriendRequest]:
    """
    Get incoming friend request links.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    list[FriendRequest]
        Incoming friend request links
    """
    return [link for link in current_user.receiver_links if link.status == status]


def get_incoming_friend_requests(current_user: User, status: str = "pending") -> list[User]:
    """
    Get incoming friend requests.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    list[User]
        Incoming friend requests
    """
    return [link.sender for link in current_user.receiver_links if link.status == status]


def get_friend_links(current_user: User, status: str = "confirmed") -> list[Friend]:
    """
    Get friends links.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    list[Friend]
        Friend links
    """
    return [link for link in current_user.friend_1_links if link.status == status] + [
        link for link in current_user.friend_2_links if link.status == status
    ]


def get_friends(current_user: User, status: str = "confirmed") -> list[User]:
    """
    Get friends.

    Parameters
    ----------
    current_user : User
        Current user

    Returns
    -------
    list[User]
        Friend
    """
    return [link.friend_1 for link in current_user.friend_1_links if link.status == status] + [
        link.friend_2 for link in current_user.friend_2_links if link.status == status
    ]
