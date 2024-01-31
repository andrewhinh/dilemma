"""User routes."""
import uuid
from datetime import datetime
from typing import Annotated, List, Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, Security
from fastapi.responses import RedirectResponse
from sqlmodel import Session

from app.database import get_session
from app.dependencies.system import verify_api_key
from app.dependencies.users import (
    ACCESS_TOKEN_EXPIRES,
    CREDENTIALS_EXCEPTION,
    REFRESH_TOKEN_EXPIRES,
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
    get_verification_code,
    google_decode_refresh_token,
    google_encode_refresh_token,
    google_get_new_access_token,
    google_get_tokens_from_code,
    google_get_user_from_user_info,
    google_get_user_info_from_access_token,
    send_email,
    set_auth_cookies,
    set_redirect_fe,
    verify_password,
)
from app.models.users import (
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
    VerificationCode,
)

router = APIRouter(
    tags=["users"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


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

    Raises
    ------
    HTTPException
        User not found
    """
    db_user = UserUpdate.model_validate(user)

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

    if get_user(session, email=db_user.email):
        raise HTTPException(
            status_code=400,
            detail="Email is invalid",
        )

    verify_code = VerificationCode(
        email=db_user.email,
        code=uuid.uuid4().hex[:6],
    )
    session.add(verify_code)
    session.commit()
    session.refresh(verify_code)

    body = f"""
## Welcome!

Head back to the website and enter the following code to continue:

## {verify_code.code}

If you did not request this code, please ignore this email.
    """
    send_email(db_user.email, subject="Verify Email", body=body)
    return {"message": "Verification email sent"}


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
    RedirectResponse
        Redirect to profile page

    Raises
    ------
    HTTPException
        Email is empty
        Username is empty
        Password is empty
        Confirm password is empty
        Passwords do not match
        Code is empty
        Email is invalid
        Username is invalid
        Code is invalid
        Previous code not found, request new code
    """
    db_user = UserCreate.model_validate(user)

    if not db_user.verify_code:
        raise HTTPException(
            status_code=400,
            detail="Code is empty",
        )
    verify_code = get_verification_code(session, db_user.email)
    now = datetime.utcnow()

    if not verify_code:
        raise HTTPException(
            status_code=404,
            detail="Previous code not found, request new code",
        )
    if verify_code.code != db_user.verify_code or verify_code.status == "verified":
        raise HTTPException(
            status_code=400,
            detail="Code is invalid",
        )
    if verify_code.expire_date < now or verify_code.status == "expired":
        if verify_code.status != "expired":
            verify_code.status = "expired"
            session.add(verify_code)
            session.commit()
            session.refresh(verify_code)
        raise HTTPException(
            status_code=400,
            detail="Code is expired, request new code",
        )

    verify_code.status = "verified"
    verify_code.verify_date = now
    session.add(verify_code)

    access_token = create_token(data={"email": user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    refresh_token = create_token(data={"email": user.email}, expires_delta=REFRESH_TOKEN_EXPIRES)

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
    session.refresh(verify_code)
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
    RedirectResponse
        Redirect to profile page

    Raises
    ------
    HTTPException
        Incorrect email or password
    """
    provider = "dilemma"
    db_user = UserCreate.model_validate(user)

    if db_user.email:
        verified_user = get_user(session, provider, email=db_user.email)
    elif db_user.username:
        verified_user = get_user(session, provider, username=db_user.username)
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


@router.post("/token/google")
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
    dict[str, str]
        URL to redirect to

    Raises
    ------
    HTTPException
        Email is empty
        Username is empty
        Password is empty
        Confirm password is empty
        Passwords do not match
        Code is empty
        Email is invalid
        Username is invalid
        Code is invalid
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

    if not access_token:
        raise CREDENTIALS_EXCEPTION
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
        response = set_redirect_fe(response, "/login")
        return response
    elif not db_user and auth.state == "login":
        response = set_redirect_fe(response, "/signup")
        return response
    else:  # shouldn't happen
        raise CREDENTIALS_EXCEPTION

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    set_auth_cookies(response, access_token, enc_refresh_token, provider)
    return UserRead.model_validate(db_user)


@router.post("/token/refresh", response_model=UserRead)
async def refresh_token(
    *,
    session: Session = Depends(get_session),
    response: Response,
    access_token: Optional[str] = Cookie(default=None),
    refresh_token: Optional[str] = Cookie(default=None),
    provider: Optional[str] = Cookie(default=None),
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
        token_type and uid

    Raises
    ------
    HTTPException
        Token expired
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
    access_token: Optional[str] = Cookie(default=None),
    refresh_token: Optional[str] = Cookie(default=None),
    provider: Optional[str] = Cookie(default=None),
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
            session.refresh(user)
        except HTTPException:  # If not, try to get user from refresh token
            try:
                if not refresh_token:
                    raise CREDENTIALS_EXCEPTION
                user = get_user_from_token(session, provider, refresh_token)
                user.refresh_token = None
                session.add(user)
                session.commit()
                session.refresh(user)
            except HTTPException:
                pass

    delete_auth_cookies(response)
    return {"message": "Logout successful"}


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

    Raises
    ------
    HTTPException
        User not found
    """
    provider = "dilemma"
    db_user = UserUpdate.model_validate(user)

    if db_user.email:
        verified_user = get_user(session, provider, email=db_user.email)
    elif db_user.username:
        verified_user = get_user(session, provider, username=db_user.username)
    else:
        raise HTTPException(
            status_code=400,
            detail="Username or email is empty",
        )

    if verified_user:
        recovery_code = uuid.uuid4().hex[:6]
        verified_user.recovery_code = recovery_code
        session.add(verified_user)
        session.commit()
        session.refresh(verified_user)

        body = f"""
## You've requested a password reset.

Head back to the website and enter the following code to continue:

## {recovery_code}

If you did not request this code, please ignore this email.
        """
        send_email(verified_user.email, subject="Password Recovery", body=body)

    return {"message": "Password recovery email sent"}


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

    Raises
    ------
    HTTPException
        Code not found
    """
    provider = "dilemma"
    db_user = UserUpdate.model_validate(user)

    if not db_user.recovery_code:
        raise HTTPException(status_code=400, detail="Code is empty")

    if db_user.email:
        verified_user = get_user(session, provider, email=db_user.email)
    elif db_user.username:
        verified_user = get_user(session, provider, username=db_user.username)
    else:
        raise HTTPException(
            status_code=400,
            detail="Username or email is empty",
        )

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
    dict[str, str]
        Message

    Raises
    ------
    HTTPException
        Passwords do not match
    """
    provider = "dilemma"
    response = RedirectResponse("/")
    db_user = UserUpdate.model_validate(user)

    if not db_user.password:
        raise HTTPException(status_code=400, detail="Password is empty")
    if not db_user.confirm_password:
        raise HTTPException(status_code=400, detail="Confirm password is empty")
    if db_user.password != db_user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if db_user.email:
        verified_user = get_user(session, provider, email=db_user.email)
    elif db_user.username:
        verified_user = get_user(session, provider, username=db_user.username)
    else:
        raise HTTPException(
            status_code=400,
            detail="Username or email is empty",
        )

    if not verified_user:
        raise HTTPException(status_code=400, detail="Email is invalid")

    verified_user.hashed_password = get_password_hash(db_user.password)
    session.add(verified_user)
    session.commit()
    session.refresh(verified_user)

    response = set_redirect_fe(response, "/login")
    return response


@router.get("/user/", response_model=UserRead)
async def read_user(
    *,
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
    user = UserRead.model_validate(current_user)
    return user


@router.patch("/user/update", response_model=UserRead)
async def update_user(  # noqa: C901
    *,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    provider: Optional[str] = Cookie(default=None),
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
        token_type and uid

    Raises
    ------
    HTTPException
        User not found
    """
    user_data = new_user.model_dump(exclude_unset=True)
    identity_changed = False

    if "email" in user_data.keys():
        if not user_data["email"]:
            raise HTTPException(
                status_code=400,
                detail="Email is empty",
            )
        if current_user.email != user_data["email"]:
            identity_changed = True
            if get_user(session, email=user_data["email"]):
                raise HTTPException(
                    status_code=400,
                    detail="Email is invalid",
                )

    if "username" in user_data.keys():
        if not user_data["username"]:
            raise HTTPException(
                status_code=400,
                detail="Username is empty",
            )
        if current_user.username != user_data["username"]:
            identity_changed = True
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

    if identity_changed:
        if provider == "dilemma":
            access_token = create_token(data={"email": current_user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
        elif provider == "google":
            dec_refresh_token = google_decode_refresh_token(refresh_token)
            access_token = google_get_new_access_token(dec_refresh_token)
        else:
            raise CREDENTIALS_EXCEPTION
        set_auth_cookies(response, access_token, refresh_token, provider)

    return UserRead.model_validate(current_user)


@router.delete("/user/delete", response_model=dict[str, str])
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

        new_friend_request = FriendRequest(sender=current_user, receiver=friend)
        session.add(new_friend_request)
        session.commit()
        session.refresh(new_friend_request)
        return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")


@router.post("/friends/revert-request", response_model=UserRead)
def revert_friend_request(
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
                new_friend = Friend(friend_1=current_user, friend_2=friend)
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
            join_date=friend_request.join_date,
            profile_picture=friend_request.profile_picture,
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
            join_date=friend_request.join_date,
            profile_picture=friend_request.profile_picture,
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
            join_date=friend.join_date,
            profile_picture=friend.profile_picture,
            username=friend.username,
            friendship_date=link.friendship_date,
        )
        for friend, link in zip(friends, friend_links, strict=False)
    ]
    return friends


@router.post("/friends/delete", response_model=UserRead)
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
                return UserRead.model_validate(current_user)
    else:
        raise HTTPException(status_code=404, detail="Friend not found")
