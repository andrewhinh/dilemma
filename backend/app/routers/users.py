"""User routes."""
import smtplib
import uuid
from typing import Annotated, Optional, Union

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
    get_password_hash,
    get_team,
    get_user,
    get_user_from_token,
    set_cookie,
)
from app.models import (
    Team,
    TeamCreate,
    TeamRead,
    TeamReadWithUsers,
    TeamUpdate,
    Token,
    User,
    UserCreate,
    UserRead,
    UserReadWithTeam,
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

    if get_user(db_user.email, session):
        raise HTTPException(
            status_code=400,
            detail="Email is invalid",
        )

    user = User(email=db_user.email, hashed_password=get_password_hash(db_user.password))
    session.add(user)
    session.commit()
    session.refresh(user)

    user = authenticate_user(db_user.email, db_user.password, user.hashed_password, session)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"email": user.email}, expires_delta=ACCESS_TOKEN_EXPIRES)
    refresh_token = create_access_token(data={"email": user.email}, expires_delta=REFRESH_TOKEN_EXPIRES)

    user.refresh_token = refresh_token
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

    verified_user = get_user(db_user.email, session)
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
async def logout(*, response: Response):
    """Logout.

    Parameters
    ----------
    response
        Response

    Returns
    -------
    dict[str, str]
        Message
    """
    response.delete_cookie("refresh_token")
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

    user = get_user(db_user.email, session)
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

    verified_user = get_user(db_user.email, session)
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

    verified_user = get_user(db_user.email, session)
    if not verified_user:
        raise HTTPException(status_code=400, detail="Email is invalid")

    verified_user.hashed_password = get_password_hash(db_user.password)
    session.add(verified_user)
    session.commit()
    session.refresh(verified_user)

    read_user = UserRead.model_validate(verified_user)
    return read_user


@router.get("/user/", response_model=UserReadWithTeam)
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
    if not get_user(current_user.email, session):
        raise HTTPException(status_code=404, detail="User not found")
    user = UserReadWithTeam.model_validate(current_user)
    return user


@router.patch("/user/update", response_model=Union[Token, UserRead])
async def update_user(
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
            if get_user(user_data["email"], session):
                raise HTTPException(
                    status_code=400,
                    detail="Email is invalid",
                )
            email_changed = True

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


@router.post("/team/create", response_model=TeamRead)
def create_team(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
    team: TeamCreate,
):
    db_team = Team.model_validate(team)
    if get_team(db_team.name, session):
        raise HTTPException(status_code=400, detail="Team already exists")
    user = UserReadWithTeam.model_validate(current_user)
    if user.team:
        raise HTTPException(status_code=400, detail="User already in team")

    current_user.team_role = "admin"
    db_team.users.append(current_user)
    session.add(db_team)
    session.commit()
    session.refresh(current_user)
    session.refresh(db_team)
    return db_team


@router.post("/team/join", response_model=TeamRead)
def join_team(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
    team: TeamCreate,
):
    user = UserReadWithTeam.model_validate(current_user)
    if user.team:
        raise HTTPException(status_code=400, detail="User already in team")
    db_team = Team.model_validate(team)
    team = get_team(db_team.name, session)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if current_user in team.users:
        raise HTTPException(status_code=400, detail="User already in team")

    current_user.team_role = "member"
    team.users.append(current_user)
    session.add(team)
    session.commit()
    session.refresh(current_user)
    session.refresh(team)
    return team


@router.get("/team/", response_model=TeamReadWithUsers)
def read_team(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    user = UserReadWithTeam.model_validate(current_user)
    if not user.team:
        raise HTTPException(status_code=400, detail="User not in team")
    team = get_team(user.team.name, session)
    return team


@router.patch("/team/update", response_model=TeamRead)
def update_team(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
    team: TeamUpdate,
):
    if current_user.team_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    user = UserReadWithTeam.model_validate(current_user)
    if not user.team:
        raise HTTPException(status_code=400, detail="User not in team")
    db_team = get_team(user.team.name, session)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    if current_user not in db_team.users:
        raise HTTPException(status_code=403, detail="Forbidden")
    team_data = team.model_dump(exclude_unset=True)
    for key, value in team_data.items():
        setattr(db_team, key, value)
    session.add(db_team)
    session.commit()
    session.refresh(db_team)
    return db_team


@router.post("/team/leave", response_model=TeamRead)
def leave_team(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    user = UserReadWithTeam.model_validate(current_user)
    if not user.team:
        raise HTTPException(status_code=400, detail="User not in team")
    team = get_team(user.team.name, session)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if current_user not in team.users:
        raise HTTPException(status_code=400, detail="User not in team")
    current_user.team_role = None
    team.users.remove(current_user)
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


@router.delete("/team/delete")
def delete_team(
    *,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> dict[str, str]:
    if current_user.team_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    user = UserReadWithTeam.model_validate(current_user)
    if not user.team:
        raise HTTPException(status_code=400, detail="User not in team")
    team = get_team(user.team.name, session)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    current_user.team_role = None
    session.delete(team)
    session.commit()
    return {"message": "Team deleted"}
