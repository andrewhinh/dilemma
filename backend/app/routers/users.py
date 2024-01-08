"""User routes."""
import smtplib
import uuid
from datetime import datetime
from typing import Annotated, List, Optional, Union

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlmodel import Session

from app.config import get_settings
from app.database import get_session
from app.dependencies.users import (
    ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES,
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_friend_links,
    get_friends,
    get_incoming_friend_request_links,
    get_incoming_friend_requests,
    get_password_hash,
    get_sent_friend_request_links,
    get_sent_friend_requests,
    get_user,
    get_user_from_token,
    set_cookie,
)
from app.models import (
    FriendRead,
    FriendRequestRead,
    FriendRequests,
    Friends,
    Token,
    User,
    UserCreate,
    UserRead,
    UserReference,
    UserUpdate,
)

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "Not found"}},
)
SETTINGS = get_settings()
smtp_ssl_host = SETTINGS.smtp_ssl_host
smtp_ssl_port = SETTINGS.smtp_ssl_port
smtp_ssl_login = SETTINGS.smtp_ssl_login
smtp_ssl_password = SETTINGS.smtp_ssl_password


@router.post("/token/signup", response_model=Token)
async def signup(*, session: Session = Depends(get_session), response: Response, user: UserCreate):
    """Signup."""
    db_user = UserCreate.model_validate(user)

    if not db_user.email:
        raise HTTPException(
            status_code=400,
            detail="Email is empty",
        )
    if not db_user.username:
        raise HTTPException(
            status_code=400,
            detail="Username is empty",
        )
    if not db_user.password:
        raise HTTPException(
            status_code=400,
            detail="Password is empty",
        )
    if not db_user.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Confirm password is empty",
        )
    if db_user.password != db_user.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match",
        )

    if get_user(session, db_user.email):
        raise HTTPException(
            status_code=400,
            detail="Email is invalid",
        )

    if get_user(session, username=db_user.username):
        raise HTTPException(
            status_code=400,
            detail="Username is invalid",
        )

    access_token = create_access_token(data={"email": user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    refresh_token = create_access_token(data={"email": user.email}, expires_delta=REFRESH_TOKEN_EXPIRES)

    user = User(
        email=db_user.email,
        username=db_user.username,
        hashed_password=get_password_hash(db_user.password),
        refresh_token=refresh_token,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    set_cookie(refresh_token=refresh_token, response=response)
    return Token(access_token=access_token, token_type="bearer", uid=user.uid)


@router.post("/token/login", response_model=Token)
async def login(
    *,
    session: Session = Depends(get_session),
    response: Response,
    user: UserCreate,
):
    """Login for access token.

    Parameters
    ----------
    session
        Database session
    user
        User login
    response
        Response

    Returns
    -------
    Token
        Access token

    Raises
    ------
    HTTPException
        Incorrect email or password
    """
    db_user = UserCreate.model_validate(user)

    if not db_user.email and not db_user.username:
        raise HTTPException(
            status_code=400,
            detail="Username or email is empty",
        )

    if not db_user.password:
        raise HTTPException(
            status_code=400,
            detail="Password is empty",
        )

    if db_user.email:
        verified_user = get_user(session, db_user.email)
    elif db_user.username:
        verified_user = get_user(session, username=db_user.username)
    if not verified_user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not authenticate_user(verified_user.email, db_user.password, verified_user.hashed_password, session):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"email": verified_user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    refresh_token = create_access_token(data={"email": verified_user.email}, expires_delta=REFRESH_TOKEN_EXPIRES)

    verified_user.refresh_token = refresh_token
    session.add(verified_user)
    session.commit()
    session.refresh(verified_user)

    set_cookie(refresh_token=refresh_token, response=response)
    return Token(access_token=access_token, token_type="bearer", uid=verified_user.uid)


@router.post("/token/refresh", response_model=Token)
async def refresh_token(
    *,
    session: Session = Depends(get_session),
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
):
    """Refresh token.

    Parameters
    ----------
    session
        Database session
    refresh_token
        Refresh token
    response
        Response

    Returns
    -------
    Token
        Access token

    Raises
    ------
    HTTPException
        Token expired
    """
    if not refresh_token:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = get_user_from_token(refresh_token, session)
    if user.refresh_token != refresh_token:
        raise HTTPException(status_code=403, detail="Forbidden")

    access_token = create_access_token(data={"email": user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    refresh_token = create_access_token(data={"email": user.email}, expires_delta=REFRESH_TOKEN_EXPIRES)

    user.refresh_token = refresh_token
    session.add(user)
    session.commit()
    session.refresh(user)

    set_cookie(refresh_token=refresh_token, response=response)
    return Token(access_token=access_token, token_type="bearer", uid=user.uid)


@router.post("/token/logout")
async def logout(
    *,
    session: Session = Depends(get_session),
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
):
    """Logout.

    Parameters
    ----------
    session
        Database session
    response
        Response
    refresh_token
        Refresh token

    Returns
    -------
    dict[str, str]
        Message
    """
    if refresh_token:
        response.delete_cookie("refresh_token")
        user = get_user_from_token(refresh_token, session)
        user.refresh_token = None
        session.add(user)
        session.commit()
        session.refresh(user)

    return {"message": "Logged out"}


@router.post("/forgot-password")
async def forgot_password(
    *,
    session: Session = Depends(get_session),
    user: UserUpdate,
):
    """Forgot password.

    Parameters
    ----------
    session
        Database session
    user
        UserUpdate

    Returns
    -------
    dict[str, str]
        Message

    Raises
    ------
    HTTPException
        User not found
    """
    db_user = UserUpdate.model_validate(user)
    if not db_user.email:
        raise HTTPException(status_code=400, detail="Email is empty")

    user = get_user(session, db_user.email)
    if user:
        s = smtplib.SMTP(smtp_ssl_host, smtp_ssl_port)
        s.ehlo()
        s.starttls()
        s.ehlo()
        s.login(smtp_ssl_login, smtp_ssl_password)

        recovery_code = uuid.uuid4().hex
        user.recovery_code = recovery_code
        session.add(user)
        session.commit()
        session.refresh(user)

        message = f"Subject: Password recovery\n\nYou've requested a password reset.\n\nYour code is {recovery_code}.\n\nReturn to the app and enter the code to continue."
        s.sendmail(smtp_ssl_login, user.email, message)
        s.quit()

    return {"message": "Password recovery email sent"}


@router.post("/check-code")
async def check_code(
    *,
    session: Session = Depends(get_session),
    user: UserUpdate,
):
    """Check code.

    Parameters
    ----------
    session
        Database session
    user
        UserUpdate

    Returns
    -------
    dict[str, str]
        Message

    Raises
    ------
    HTTPException
        Code not found
    """
    db_user = UserUpdate.model_validate(user)
    if not db_user.email:
        raise HTTPException(status_code=400, detail="Email is empty")
    if not db_user.recovery_code:
        raise HTTPException(status_code=400, detail="Code is empty")

    verified_user = get_user(session, db_user.email)
    if not verified_user:
        raise HTTPException(status_code=400, detail="Email is invalid")
    if not verified_user.recovery_code:
        raise HTTPException(status_code=404, detail="Previous code not found, request new code")
    if verified_user.recovery_code != db_user.recovery_code:
        raise HTTPException(status_code=400, detail="Code is invalid")

    verified_user.recovery_code = None
    session.add(verified_user)
    session.commit()
    session.refresh(verified_user)

    return {"message": "Code is valid"}


@router.post("/reset-password", response_model=UserRead)
async def reset_password(
    *,
    session: Session = Depends(get_session),
    user: UserUpdate,
):
    """Reset password.

    Parameters
    ----------
    session
        Database session
    user
        UserUpdate

    Returns
    -------
    dict[str, str]
        Message

    Raises
    ------
    HTTPException
        Passwords do not match
    """
    db_user = UserUpdate.model_validate(user)
    if not db_user.email:
        raise HTTPException(status_code=400, detail="Email is empty")
    if not db_user.password:
        raise HTTPException(status_code=400, detail="Password is empty")
    if not db_user.confirm_password:
        raise HTTPException(status_code=400, detail="Confirm password is empty")
    if db_user.password != db_user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    verified_user = get_user(session, db_user.email)
    if not verified_user:
        raise HTTPException(status_code=400, detail="Email is invalid")

    verified_user.hashed_password = get_password_hash(db_user.password)
    session.add(verified_user)
    session.commit()
    session.refresh(verified_user)

    read_user = UserRead.model_validate(verified_user)
    return read_user


@router.get("/user/", response_model=UserRead)
async def read_user(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Get current user.

    Parameters
    ----------
    session
        Database session
    current_user
        Current user

    Returns
    -------
    User
        Current user

    Raises
    ------
    HTTPException
        User not found
    """
    if not get_user(session, current_user.email):
        raise HTTPException(status_code=404, detail="User not found")
    user = UserRead.model_validate(current_user)
    return user


@router.patch("/user/update", response_model=Union[Token, UserRead])
async def update_user(  # noqa: C901
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
    response: Response,
    new_user: UserUpdate,
):
    """Update user with new field(s).

    Parameters
    ----------
    session
        Database session
    current_user
        Current user
    new_user
        New user data
    response
        Response

    Returns
    -------
    Union[Token, UserRead]

    Raises
    ------
    HTTPException
        User not found
    """
    email_changed = False
    user_data = new_user.model_dump(exclude_unset=True)

    if "email" in user_data.keys():
        if current_user.email != user_data["email"]:
            if get_user(session, user_data["email"]):
                raise HTTPException(
                    status_code=400,
                    detail="Email is invalid",
                )
            email_changed = True

    if "username" in user_data.keys():
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

    for key, value in user_data.items():
        setattr(current_user, key, value)

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    if email_changed:
        access_token = create_access_token(data={"email": current_user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
        refresh_token = create_access_token(data={"email": current_user.email}, expires_delta=REFRESH_TOKEN_EXPIRES)

        current_user.refresh_token = refresh_token
        session.add(current_user)
        session.commit()
        session.refresh(current_user)

        set_cookie(refresh_token=refresh_token, response=response)
        return Token(access_token=access_token, token_type="bearer", uid=current_user.uid)
    else:
        read_user = UserRead.model_validate(current_user)
        return read_user


@router.delete("/user/delete")
def delete_user(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> dict[str, str]:
    session.delete(current_user)
    session.commit()
    return {"message": "User deleted"}


@router.post("/friends/send-request", response_model=UserRead)
def send_friend_request(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
    friend: UserReference,
):
    db_friend = UserReference.model_validate(friend)
    if not db_friend.username:
        raise HTTPException(status_code=400, detail="Username is empty")
    if current_user.username == db_friend.username:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")

    friend = get_user(session, username=db_friend.username)
    if friend:
        if friend in get_sent_friend_requests(current_user):
            raise HTTPException(status_code=400, detail="Friend request already sent")
        if friend in get_incoming_friend_requests(current_user):
            raise HTTPException(status_code=400, detail="Friend request already received")
        if friend in get_friends(current_user):
            raise HTTPException(status_code=400, detail="Friend already added")

        new_friend_request = FriendRequests(
            sender=current_user, receiver=friend, request_date=datetime.now(), status="pending"
        )
        session.add(new_friend_request)
        session.commit()
        session.refresh(new_friend_request)
        return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")


@router.post("/friends/accept-request", response_model=UserRead)
def accept_friend_request(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
    friend: UserReference,
):
    db_friend = UserReference.model_validate(friend)
    if not db_friend.username:
        raise HTTPException(status_code=400, detail="Username is empty")
    if current_user.username == db_friend.username:
        raise HTTPException(status_code=400, detail="Cannot accept request from yourself")

    friend = get_user(session, username=db_friend.username)
    if friend:
        friend_request_links = get_incoming_friend_request_links(current_user)
        friend_requests = get_incoming_friend_requests(current_user)
        if friend not in friend_requests:
            raise HTTPException(status_code=400, detail="Friend request not sent")
        if friend in get_friends(current_user):
            raise HTTPException(status_code=400, detail="Friend already added")

        for friend_request, friend_request_link in zip(friend_requests, friend_request_links, strict=False):
            if friend_request.username == friend.username:
                friend_request_link.status = "accepted"
                new_friend = Friends(
                    friend_1=current_user, friend_2=friend, friendship_date=datetime.now(), status="confirmed"
                )
                session.add(current_user)
                session.add(new_friend)
                session.commit()
                session.refresh(current_user)
                return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")


@router.post("/friends/decline-request", response_model=UserRead)
def decline_friend_request(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
    friend: UserReference,
):
    db_friend = UserReference.model_validate(friend)
    if not db_friend.username:
        raise HTTPException(status_code=400, detail="Username is empty")
    if current_user.username == db_friend.username:
        raise HTTPException(status_code=400, detail="Cannot decline request from yourself")

    friend = get_user(session, username=db_friend.username)
    if friend:
        friend_request_links = get_incoming_friend_request_links(current_user)
        friend_requests = get_incoming_friend_requests(current_user)
        if friend not in friend_requests:
            raise HTTPException(status_code=400, detail="Friend request not sent")
        if friend in get_friends(current_user):
            raise HTTPException(status_code=400, detail="Friend already added")

        for friend_request, friend_request_link in zip(friend_requests, friend_request_links, strict=False):
            if friend_request.username == friend.username:
                friend_request_link.status = "declined"
                session.add(current_user)
                session.commit()
                session.refresh(current_user)
                return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")


@router.get("/friends/requests/sent", response_model=List[FriendRequestRead])
def read_sent_friend_requests(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    friend_request_links = get_sent_friend_request_links(current_user)
    friend_requests = get_sent_friend_requests(current_user)
    friend_requests = [
        FriendRequestRead(
            uid=friend_request.uid,
            username=friend_request.username,
            request_date=link.request_date,
        )
        for friend_request, link in zip(friend_requests, friend_request_links, strict=False)
    ]
    return friend_requests


@router.get("/friends/requests/incoming", response_model=List[FriendRequestRead])
def read_incoming_friend_requests(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    friend_request_links = get_incoming_friend_request_links(current_user)
    friend_requests = get_incoming_friend_requests(current_user)
    friend_requests = [
        FriendRequestRead(
            uid=friend_request.uid,
            username=friend_request.username,
            status=link.status,
            request_date=link.request_date,
        )
        for friend_request, link in zip(friend_requests, friend_request_links, strict=False)
    ]
    return friend_requests


@router.get("/friends/", response_model=List[FriendRead])
def read_friends(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    friend_links = get_friend_links(current_user)
    friends = get_friends(current_user)
    friends = [
        FriendRead(
            uid=friend.uid,
            username=friend.username,
            status=link.status,
            friendship_date=link.friendship_date,
        )
        for friend, link in zip(friends, friend_links, strict=False)
    ]
    return friends


@router.post("/friends/delete")
def delete_friend(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
    friend: UserReference,
):
    db_friend = UserReference.model_validate(friend)
    if not db_friend.username:
        raise HTTPException(status_code=400, detail="Username is empty")
    if current_user.username == db_friend.username:
        raise HTTPException(status_code=400, detail="Cannot delete yourself as a friend")

    friend = get_user(session, username=db_friend.username)
    if friend:
        friend_links = get_friend_links(current_user)
        friends = get_friends(current_user)
        if friend not in friends:
            raise HTTPException(status_code=400, detail="Friend not added")

        for delete_friend, delete_friend_link in zip(friends, friend_links, strict=False):
            if delete_friend.username == friend.username:
                delete_friend_link.status = "deleted"
                session.add(current_user)
                session.commit()
                session.refresh(current_user)
                return {"message": "Friend deleted"}
    else:
        raise HTTPException(status_code=404, detail="Friend not found")
