"""User routes."""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, Security
from fastapi.responses import RedirectResponse
from sqlmodel import Session

from app.database import get_session
from app.dependencies.security import verify_api_key
from app.dependencies.users import (
    ACCESS_TOKEN_EXPIRES,
    CREDENTIALS_EXCEPTION,
    RECOVERY_CODE_EXPIRES,
    REFRESH_TOKEN_EXPIRES,
    VERIFY_CODE_EXPIRES,
    create_token,
    delete_auth_cookies,
    generate_username_from_email,
    get_current_active_user,
    get_friend_links,
    get_friends,
    get_google_auth_url,
    get_incoming_friend_request_links,
    get_incoming_friend_requests,
    get_password_hash,
    get_sent_friend_request_links,
    get_sent_friend_requests,
    get_user,
    get_user_from_token,
    google_decode_refresh_token,
    google_encode_refresh_token,
    google_get_new_access_token,
    google_get_tokens_from_code,
    google_get_user_from_user_info,
    google_get_user_info_from_access_token,
    send_email,
    set_auth_cookies,
    set_redirect_fe,
    verify_code,
    verify_password,
    verify_user_update,
)
from app.models.users import (
    AuthCode,
    Friend,
    FriendRead,
    FriendRequest,
    FriendRequestRead,
    GoogleAuth,
    User,
    UserCreate,
    UserRead,
    UserReference,
    UserUpdate,
)

router = APIRouter(
    tags=["users"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


# Native signup/login
@router.post("/verify-email", response_model=dict[str, str])
async def verify_email(
    *,
    session: Session = Depends(get_session),
    user: UserCreate,
):
    """Verify email.

    Parameters
    ----------
    user
        UserUpdate

    Returns
    -------
    dict[str, str]
        Message
    """
    db_user = UserCreate.model_validate(user)

    if not db_user.email:
        raise HTTPException(
            status_code=400,
            detail="Email is empty",
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

    user_exists = get_user(session, email=db_user.email)
    if not user_exists:
        verify_code = AuthCode(
            email=db_user.email,
            request_type="verify",
            expire_date=datetime.utcnow() + VERIFY_CODE_EXPIRES,
        )
        session.add(verify_code)
        session.commit()

        body = f"""
## Welcome!

Head back to the website and enter the following code to continue:

## {verify_code.code}

If you did not request this code, please ignore this email.
        """
        send_email(db_user.email, subject="Verify Email", body=body)

    return {"message": "If the email exists, you will receive a verification email shortly."}


@router.post("/token/signup", response_model=UserRead)
async def signup(
    *,
    session: Session = Depends(get_session),
    response: Response,
    user: UserCreate,
):
    """Signup.

    Parameters
    ----------
    user
        User signup

    Returns
    -------
    UserRead
        User
    """
    db_user = UserCreate.model_validate(user)
    verify_code(session, db_user.code, db_user.email, "verify")

    access_token = create_token(data={"email": db_user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    refresh_token = create_token(data={"email": db_user.email}, expires_delta=REFRESH_TOKEN_EXPIRES)

    created_user = User(
        profile_picture=db_user.profile_picture,
        email=db_user.email,
        username=generate_username_from_email(session, db_user.email),
        fullname=db_user.fullname,
        hashed_password=get_password_hash(db_user.password),
        refresh_token=refresh_token,
    )
    session.add(created_user)
    session.commit()
    session.refresh(created_user)

    set_auth_cookies(response, access_token, refresh_token, created_user.provider)
    return UserRead.model_validate(created_user)


@router.post("/token/login", response_model=UserRead)
async def login(
    *,
    session: Session = Depends(get_session),
    response: Response,
    user: UserCreate,
):
    """Login for access token.

    Parameters
    ----------
    user
        User login

    Returns
    -------
    UserRead
        User
    """
    provider = "dilemma"
    db_user = UserCreate.model_validate(user)

    if db_user.email:
        verified_user = get_user(session, disabled=False, provider=provider, email=db_user.email)
    elif db_user.username:
        verified_user = get_user(session, disabled=False, provider=provider, username=db_user.username)
    else:
        raise HTTPException(
            status_code=400,
            detail="Username or email is empty",
        )
    if not db_user.password:
        raise HTTPException(
            status_code=400,
            detail="Password is empty",
        )
    if not verified_user or not verify_password(db_user.password, verified_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_token(data={"email": verified_user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    refresh_token = create_token(data={"email": verified_user.email}, expires_delta=REFRESH_TOKEN_EXPIRES)

    verified_user.refresh_token = refresh_token
    session.add(verified_user)
    session.commit()
    session.refresh(verified_user)

    set_auth_cookies(response, access_token, refresh_token, provider)
    return UserRead.model_validate(verified_user)


# Google signup/login
@router.post("/verify-email/google", response_class=RedirectResponse)
async def verify_email_google(
    *,
    auth: GoogleAuth,
):
    """Get Google login page URL.

    Parameters
    ----------
    auth
        GoogleAuth

    Returns
    -------
    RedirectResponse
        Redirect to Google login page
    """
    if not auth.state:
        raise HTTPException(
            status_code=400,
            detail="State is empty",
        )
    response = RedirectResponse(get_google_auth_url(auth.state))
    return response


@router.post("/token/google", response_model=UserRead)
async def auth_google(
    *,
    session: Session = Depends(get_session),
    response: Response,
    auth: GoogleAuth,
):
    """Signup/login with Google.

    Parameters
    ----------
    auth
        GoogleAuth

    Returns
    -------
    UserRead
        User
    """
    provider = "google"

    if not auth.code:
        raise HTTPException(
            status_code=400,
            detail="Code is empty",
        )
    if not auth.state:
        raise HTTPException(
            status_code=400,
            detail="State is empty",
        )

    tokens = google_get_tokens_from_code(auth.code)
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]
    enc_refresh_token = google_encode_refresh_token(refresh_token)

    user_info = google_get_user_info_from_access_token(access_token)
    db_user = google_get_user_from_user_info(session, user_info)

    if not db_user and auth.state == "signup":
        db_user = User(
            profile_picture=user_info["picture"],
            email=user_info["email"],
            username=generate_username_from_email(session, user_info["email"]),
            fullname=user_info["name"],
            refresh_token=enc_refresh_token,
            provider=provider,
        )
    elif db_user and auth.state == "login":
        db_user.refresh_token = enc_refresh_token
    elif db_user and auth.state == "signup":
        raise HTTPException(
            status_code=400,
            detail="Account already exists",
        )
    elif not db_user and auth.state == "login":
        raise HTTPException(
            status_code=400,
            detail="Account does not exist",
        )
    else:  # shouldn't happen
        raise CREDENTIALS_EXCEPTION

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    set_auth_cookies(response, access_token, enc_refresh_token, provider)
    return UserRead.model_validate(db_user)


# Token management
@router.post("/token/refresh", response_model=UserRead)
async def refresh_token(
    *,
    session: Session = Depends(get_session),
    response: Response,
    access_token: str | None = Cookie(default=None),
    refresh_token: str | None = Cookie(default=None),
    provider: str | None = Cookie(default=None),
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
        token_type and uuid
    """
    # Check if access token is valid
    try:
        if not access_token:
            raise CREDENTIALS_EXCEPTION
        user = get_user_from_token(session, provider, access_token)
        if user:
            return UserRead.model_validate(user)
    except HTTPException:
        pass

    # If not, check if refresh token is valid
    if not refresh_token:
        raise CREDENTIALS_EXCEPTION
    user = get_user_from_token(session, provider, refresh_token)
    if not user or user.refresh_token != refresh_token:
        raise CREDENTIALS_EXCEPTION

    # If valid, create new access token
    if provider == "dilemma":
        access_token = create_token(data={"email": user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    elif provider == "google":
        dec_refresh_token = google_decode_refresh_token(refresh_token)
        access_token = google_get_new_access_token(dec_refresh_token)
    else:
        raise CREDENTIALS_EXCEPTION

    set_auth_cookies(response, access_token, refresh_token, provider)
    return UserRead.model_validate(user)


@router.post("/token/logout", response_model=dict[str, str])
async def logout(
    *,
    session: Session = Depends(get_session),
    response: Response,
    access_token: str | None = Cookie(default=None),
    refresh_token: str | None = Cookie(default=None),
    provider: str | None = Cookie(default=None),
):
    """Logout.

    Parameters
    ----------
    session
        Database session
    response
        Response
    access_token
        Access token
    refresh_token
        Refresh token
    provider
        Provider

    Returns
    -------
    dict[str, str]
        Message
    """
    # Try to remove refresh token from database
    if provider:
        # Try to get user from access token
        try:
            if not access_token:
                raise CREDENTIALS_EXCEPTION
            user = get_user_from_token(session, provider, access_token)
            user.refresh_token = None
            session.add(user)
            session.commit()
        except HTTPException:  # If not, try to get user from refresh token
            try:
                if not refresh_token:
                    raise CREDENTIALS_EXCEPTION
                user = get_user_from_token(session, provider, refresh_token)
                user.refresh_token = None
                session.add(user)
                session.commit()
            except HTTPException:
                pass

    delete_auth_cookies(response)
    return {"message": "Logout successful"}


# Native password recovery
@router.post("/forgot-password", response_model=dict[str, str])
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
    """
    provider = "dilemma"
    db_user = UserUpdate.model_validate(user)

    if db_user.email:
        verified_user = get_user(session, disabled=False, provider=provider, email=db_user.email)
    elif db_user.username:
        verified_user = get_user(session, disabled=False, provider=provider, username=db_user.username)
    else:
        raise HTTPException(
            status_code=400,
            detail="Username or email is empty",
        )

    if verified_user:
        recovery_code = AuthCode(
            email=verified_user.email, request_type="recovery", expire_date=datetime.utcnow() + RECOVERY_CODE_EXPIRES
        )
        session.add(recovery_code)
        session.commit()

        body = f"""
## You've requested a password reset.

Head back to the website and enter the following code to continue:

## {recovery_code.code}

If you did not request this code, please ignore this email.
        """
        send_email(verified_user.email, subject="Password Recovery", body=body)

    return {"message": "If the email exists, you will receive a recovery email shortly."}


@router.post("/check-code", response_model=dict[str, str])
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
    """
    provider = "dilemma"
    db_user = UserUpdate.model_validate(user)

    if db_user.email:
        verified_user = get_user(session, disabled=False, provider=provider, email=db_user.email)
    elif db_user.username:
        verified_user = get_user(session, disabled=False, provider=provider, username=db_user.username)
    else:
        raise HTTPException(
            status_code=400,
            detail="Username or email is empty",
        )

    verify_code(session, db_user.code, verified_user.email, "recovery")

    return {"message": "Code is valid"}


@router.post("/reset-password", response_class=RedirectResponse)
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
    RedirectResponse
        Redirect to login
    """
    provider = "dilemma"
    response = RedirectResponse("/")
    db_user = UserUpdate.model_validate(user)

    if db_user.email:
        verified_user = get_user(session, disabled=False, provider=provider, email=db_user.email)
    elif db_user.username:
        verified_user = get_user(session, disabled=False, provider=provider, username=db_user.username)
    else:
        raise HTTPException(
            status_code=400,
            detail="Username or email is empty",
        )

    if not db_user.password:
        raise HTTPException(status_code=400, detail="Password is empty")
    if not db_user.confirm_password:
        raise HTTPException(status_code=400, detail="Confirm password is empty")
    if db_user.password != db_user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    verified_user.hashed_password = get_password_hash(db_user.password)
    session.add(verified_user)
    session.commit()

    response = set_redirect_fe(response, "/login")
    return response


# Native email management
@router.post("/verify-email/update", response_model=dict[str, str])
async def verify_email_update(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
    provider: str | None = Cookie(default=None),
    user: UserUpdate,
):
    """Verify new email.

    Parameters
    ----------
    user
        UserUpdate

    Returns
    -------
    dict[str, str]
        Message
    """
    if provider != "dilemma":
        raise HTTPException(
            status_code=400,
            detail="Unable to change email, did not create account with Dilemma",
        )

    db_user = UserUpdate.model_validate(user)

    if not db_user.email:
        raise HTTPException(
            status_code=400,
            detail="Email is empty",
        )
    if current_user.email == db_user.email:
        raise HTTPException(
            status_code=400,
            detail="Email is the same",
        )

    user_exists = get_user(session, email=db_user.email)
    if not user_exists:
        verify_code = AuthCode(
            email=db_user.email,
            request_type="verify",
            expire_date=datetime.utcnow() + VERIFY_CODE_EXPIRES,
        )
        session.add(verify_code)
        session.commit()

        body = f"""
## You've requested to update your email.

Head back to the website and enter the following code to continue:

## {verify_code.code}

If you did not request this code, please ignore this email.
        """
        send_email(db_user.email, subject="Verify Email", body=body)

    return {"message": "If the email exists, you will receive a verification email shortly."}


@router.post("/update-email", response_model=UserRead)
async def update_email(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
    response: Response,
    user: UserUpdate,
):
    """Update email.

    Parameters
    ----------
    user
        UserUpdate

    Returns
    -------
    dict[str, str]
        Message
    """
    db_user = UserUpdate.model_validate(user)
    verify_code(session, db_user.code, db_user.email, "verify")

    current_user.email = db_user.email
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    access_token = create_token(data={"email": db_user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    set_auth_cookies(response, access_token)
    return UserRead.model_validate(current_user)


# User management
@router.get("/user/", response_model=UserRead)
async def read_user(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Get current user.

    Returns
    -------
    User
        Current user
    """
    return UserRead.model_validate(current_user)


@router.patch("/user/update", response_model=UserRead)
async def update_user(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
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
    Token
        token_type and uuid
    """
    user_data = new_user.model_dump(exclude_unset=True)
    verify_user_update(session, current_user, user_data)

    for key, value in user_data.items():
        setattr(current_user, key, value)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return UserRead.model_validate(current_user)


@router.delete("/user/delete", response_model=dict[str, str])
async def delete_user(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> dict[str, str]:
    session.delete(current_user)
    session.commit()
    return {"message": "User deleted"}


# Friend request management
@router.post("/friends/send-request", response_model=UserRead)
async def send_friend_request(
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

    friend = get_user(session, disabled=False, username=db_friend.username)
    if friend:
        if friend in get_sent_friend_requests(current_user):
            raise HTTPException(status_code=400, detail="Friend request already sent")
        if friend in get_incoming_friend_requests(current_user):
            raise HTTPException(status_code=400, detail="Friend request already received")
        if friend in get_friends(current_user):
            raise HTTPException(status_code=400, detail="Friend already added")

        new_friend_request = FriendRequest(sender=current_user, receiver=friend)
        session.add(new_friend_request)
        session.commit()
        session.refresh(new_friend_request)
        return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")


@router.post("/friends/revert-request", response_model=UserRead)
async def revert_friend_request(
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

    friend = get_user(session, disabled=False, username=db_friend.username)
    if friend:
        friend_request_links = get_sent_friend_request_links(current_user)
        friend_requests = get_sent_friend_requests(current_user)
        if friend not in friend_requests:
            raise HTTPException(status_code=400, detail="Friend request not found")
        if friend in get_friends(current_user):
            raise HTTPException(status_code=400, detail="Friend already added")

        for delete_request, delete_request_link in zip(friend_requests, friend_request_links, strict=False):
            if delete_request.username == friend.username:
                delete_request_link.status = "reverted"
                session.add(current_user)
                session.commit()
                session.refresh(current_user)
                return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")


@router.post("/friends/accept-request", response_model=UserRead)
async def accept_friend_request(
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

    friend = get_user(session, disabled=False, username=db_friend.username)
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
                new_friend = Friend(friend_1=current_user, friend_2=friend)
                session.add(current_user)
                session.add(new_friend)
                session.commit()
                session.refresh(current_user)
                return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")


@router.post("/friends/decline-request", response_model=UserRead)
async def decline_friend_request(
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

    friend = get_user(session, disabled=False, username=db_friend.username)
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


@router.get("/friends/requests/sent", response_model=list[FriendRequestRead])
async def read_sent_friend_requests(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    friend_request_links = get_sent_friend_request_links(current_user)
    friend_requests = get_sent_friend_requests(current_user)
    friend_requests = [
        FriendRequestRead(
            uuid=friend_request.uuid,
            join_date=friend_request.join_date,
            profile_picture=friend_request.profile_picture,
            username=friend_request.username,
            request_date=link.request_date,
        )
        for friend_request, link in zip(friend_requests, friend_request_links, strict=False)
    ]
    return friend_requests


@router.get("/friends/requests/incoming", response_model=list[FriendRequestRead])
async def read_incoming_friend_requests(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    friend_request_links = get_incoming_friend_request_links(current_user)
    friend_requests = get_incoming_friend_requests(current_user)
    friend_requests = [
        FriendRequestRead(
            uuid=friend_request.uuid,
            join_date=friend_request.join_date,
            profile_picture=friend_request.profile_picture,
            username=friend_request.username,
            status=link.status,
            request_date=link.request_date,
        )
        for friend_request, link in zip(friend_requests, friend_request_links, strict=False)
    ]
    return friend_requests


# Friend management
@router.get("/friends/", response_model=list[FriendRead])
async def read_friends(
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    friend_links = get_friend_links(current_user)
    friends = get_friends(current_user)
    friends = [
        FriendRead(
            uuid=friend.uuid,
            join_date=friend.join_date,
            profile_picture=friend.profile_picture,
            username=friend.username,
            friendship_date=link.friendship_date,
        )
        for friend, link in zip(friends, friend_links, strict=False)
    ]
    return friends


@router.post("/friends/delete", response_model=UserRead)
async def delete_friend(
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

    friend = get_user(session, disabled=False, username=db_friend.username)
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
                return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")
