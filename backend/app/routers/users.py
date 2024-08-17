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
    get_current_active_user,
    get_google_auth_url,
    get_password_hash,
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
    GoogleAuth,
    User,
    UserCreate,
    UserRead,
    UserUpdate,
)

router = APIRouter(
    tags=["users"],
    dependencies=[Security(verify_api_key)],
    responses={404: {"description": "Not found"}},
)


# Native signup/login
@router.post("/auth/verify-email", response_model=dict[str, str])
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

    user_exists = get_user(db_user.email, session)
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


@router.post("/auth/signup", response_model=UserRead)
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
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        hashed_password=get_password_hash(db_user.password),
        refresh_token=refresh_token,
    )
    session.add(created_user)
    session.commit()
    session.refresh(created_user)

    set_auth_cookies(response, access_token, refresh_token, created_user.provider)
    return UserRead.model_validate(created_user)


@router.post("/auth/login", response_model=UserRead)
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

    if not db_user.email:
        raise HTTPException(
            status_code=400,
            detail="Email is empty",
        )
    verified_user = get_user(db_user.email, session, disabled=False, provider=provider)

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
@router.post("/auth/google/verify-email", response_class=RedirectResponse)
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


@router.post("/auth/google", response_model=UserRead)
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
            first_name=user_info["given_name"],
            last_name=user_info["family_name"],
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
@router.post("/auth/token/refresh", response_model=UserRead)
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


@router.post("/auth/logout", response_model=dict[str, str])
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
@router.post("/account/password/forgot", response_model=dict[str, str])
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

    if not db_user.email:
        raise HTTPException(
            status_code=400,
            detail="Email is empty",
        )

    verified_user = get_user(db_user.email, session, disabled=False, provider=provider)
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


@router.post("/account/code/verify", response_model=dict[str, str])
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

    if not db_user.email:
        raise HTTPException(
            status_code=400,
            detail="Email is empty",
        )

    verified_user = get_user(db_user.email, session, disabled=False, provider=provider)

    verify_code(session, db_user.code, verified_user.email, "recovery")

    return {"message": "Code is valid"}


@router.post("/account/password/reset", response_class=RedirectResponse)
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

    if not db_user.email:
        raise HTTPException(
            status_code=400,
            detail="Email is empty",
        )

    verified_user = get_user(db_user.email, session, False, provider)

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
@router.post("/account/email/verify-update", response_model=dict[str, str])
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

    user_exists = get_user(db_user.email, session)
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


@router.post("/account/email/update", response_model=UserRead)
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
@router.get("/user/profile", response_model=UserRead)
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


@router.patch("/user/profile/update", response_model=UserRead)
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
    verify_user_update(user_data)

    for key, value in user_data.items():
        setattr(current_user, key, value)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return UserRead.model_validate(current_user)


@router.delete("/user/profile/delete", response_model=UserRead)
async def delete_user(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    session.delete(current_user)
    session.commit()
    return UserRead.model_validate(current_user)


# # Chat request management
# @router.post("/chat-request/send/", response_model=ChatRequestRead)
# async def send_chat_request(
#     *,
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_active_user),
#     request: ChatRequestCreate,
# ):
#     """Send a chat request to another user."""
#     if current_user.uuid == request.receiver_uuid:
#         raise HTTPException(status_code=400, detail="Cannot send chat request to yourself")

#     receiver = session.get(User, {"uuid": request.receiver_uuid})
#     if not receiver:
#         raise HTTPException(status_code=404, detail="Receiver not found")

#     chat_request = ChatRequest(
#         phone_number=request.phone_number,
#         content=request.content,
#         requester_uuid=current_user.uuid,
#         receiver_uuid=request.receiver_uuid,
#     )
#     session.add(chat_request)
#     session.commit()
#     session.refresh(chat_request)

#     return ChatRequestRead.model_validate(chat_request)


# @router.post("/chat-request/revert/", response_model=ChatRequestRead)
# async def revert_chat_request(
#     *,
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_active_user),
#     request: ChatRequestUpdate,
# ):
#     """Revert a chat request sent to another user."""
#     chat_request = session.exec(
#         select(ChatRequest).where(
#             ChatRequest.receiver_uuid == request.receiver_uuid, ChatRequest.requester_uuid == current_user.uuid
#         )
#     ).first()
#     if not chat_request:
#         raise HTTPException(status_code=404, detail="Chat request not found or unauthorized")

#     chat_request.status = "reverted"
#     session.add(chat_request)
#     session.commit()
#     session.refresh(chat_request)

#     return ChatRequestRead.model_validate(chat_request)


# @router.patch("/chat-request/accept/", response_model=ChatRequestRead)
# async def accept_chat_request(
#     *,
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_active_user),
#     request: ChatRequestUpdate,
# ):
#     """Accept a chat request."""
#     chat_request = session.exec(
#         select(ChatRequest).where(
#             ChatRequest.requester_uuid == request.requester_uuid, ChatRequest.receiver_uuid == current_user.uuid
#         )
#     ).first()
#     if not chat_request:
#         raise HTTPException(status_code=404, detail="Chat request not found or unauthorized")

#     chat_request.status = "accepted"
#     session.add(chat_request)
#     session.commit()
#     session.refresh(chat_request)

#     return ChatRequestRead.model_validate(chat_request)


# @router.patch("/chat-request/decline/", response_model=ChatRequestRead)
# async def decline_chat_request(
#     *,
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_active_user),
#     request: ChatRequestUpdate,
# ):
#     """Decline a chat request."""
#     chat_request = session.exec(
#         select(ChatRequest).where(
#             ChatRequest.requester_uuid == request.requester_uuid, ChatRequest.receiver_uuid == current_user.uuid
#         )
#     ).first()
#     if not chat_request:
#         raise HTTPException(status_code=404, detail="Chat request not found or unauthorized")

#     chat_request.status = "declined"
#     session.add(chat_request)
#     session.commit()
#     session.refresh(chat_request)

#     return ChatRequestRead.model_validate(chat_request)


# @router.patch("/chat-request/ignore/", response_model=ChatRequestRead)
# async def ignore_chat_request(
#     *,
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_active_user),
#     request: ChatRequestUpdate,
# ):
#     """Ignore a chat request."""
#     chat_request = session.exec(
#         select(ChatRequest).where(
#             ChatRequest.requester_uuid == request.requester_uuid, ChatRequest.receiver_uuid == current_user.uuid
#         )
#     ).first()
#     if not chat_request:
#         raise HTTPException(status_code=404, detail="Chat request not found or unauthorized")

#     chat_request.status = "ignored"
#     session.add(chat_request)
#     session.commit()
#     session.refresh(chat_request)

#     return ChatRequestRead.model_validate(chat_request)
