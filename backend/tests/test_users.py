"""Test the user routes."""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.dependencies.users import get_current_active_user, get_user
from app.main import app
from app.models import User


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="base_client")
def base_client_fixture(session: Session):
    app.dependency_overrides[get_session] = lambda: session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="user_data")
def user_data_fixture(base_client: TestClient):
    credentials = {"email": "example@example.com", "username": "example", "password": "secret"}
    response = base_client.post(
        "/token/signup/",
        json={
            "email": credentials["email"],
            "username": credentials["username"],
            "password": credentials["password"],
            "confirm_password": credentials["password"],
        },
    )
    data = response.json()

    assert response.status_code == 200
    assert data["access_token"] is not None
    assert data["token_type"] == "bearer"
    assert data["uuid"] is not None
    return credentials


@pytest.fixture(name="current_user")
def current_user_fixture(user_data: dict, session: Session):
    return get_user(session, user_data["email"])


@pytest.fixture(name="client")
def client_fixture(base_client: TestClient, current_user: User):
    app.dependency_overrides[get_current_active_user] = lambda: current_user
    yield base_client
    app.dependency_overrides.clear()


def test_login_user(user_data: dict, client: TestClient):
    response = client.post(
        "/token/login/",
        json={"email": user_data["email"], "password": user_data["password"]},
    )
    data = response.json()

    assert response.status_code == 200
    assert data["access_token"] is not None
    assert data["token_type"] == "bearer"
    assert data["uuid"] is not None


def test_read_user(current_user: User, client: TestClient):
    response = client.get("/user/")
    data = response.json()

    assert response.status_code == 200
    for key in data:
        assert data[key] == getattr(current_user, key)


def test_update_user(current_user: User, client: TestClient):
    new_username = "new_example"
    response = client.patch("/user/update", json={"username": new_username})
    data = response.json()

    assert response.status_code == 200
    for key in data:
        assert data[key] == getattr(current_user, key)


def test_delete_user(client: TestClient):
    response = client.delete("/user/delete")
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted"

    response = client.get("/user/")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_send_friend_request():
    pass


def test_accept_friend_request():
    pass


def test_decline_friend_request():
    pass


def test_get_sent_friend_requests():
    pass


def test_get_incoming_friend_requests():
    pass


def test_get_friends():
    pass


def test_delete_friend():
    pass
