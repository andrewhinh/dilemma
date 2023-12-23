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
    credentials = {"email": "example@example.com", "password": "secret"}
    response = base_client.post(
        "/token/signup/",
        json={
            "email": credentials["email"],
            "password": credentials["password"],
            "confirm_password": credentials["password"],
        },
    )
    data = response.json()

    assert response.status_code == 200
    assert data["access_token"] is not None
    assert data["token_type"] == "bearer"
    assert data["uid"] is not None
    return credentials


@pytest.fixture(name="current_user")
def current_user_fixture(user_data: dict, session: Session):
    return get_user(user_data["email"], session)


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
    assert data["uid"] is not None


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


def test_create_team(client: TestClient):
    team_name = "test"
    response = client.post("/team/create", json={"name": team_name})
    data = response.json()

    assert response.status_code == 200
    assert data["name"] == team_name
    assert data["description"] is None
    assert data["uid"] is not None

    return data


def test_read_team(current_user: User, client: TestClient):
    team_data = test_create_team(client)
    response = client.get("/team/")
    data = response.json()

    assert response.status_code == 200
    user_data = data["users"][0]
    for key in user_data:
        assert user_data[key] == getattr(current_user, key)
    del data["users"]
    assert data == team_data


def test_update_team(client: TestClient):
    team_data = test_create_team(client)
    new_description = "Updated description"

    response = client.patch("/team/update", json={"description": new_description})
    updated_data = response.json()

    assert response.status_code == 200
    for key in updated_data:
        if key == "description":
            assert updated_data[key] == new_description
            assert updated_data[key] != team_data[key]
        else:
            assert updated_data[key] == team_data[key]


def test_delete_team(client: TestClient):
    test_create_team(client)
    response = client.delete("/team/delete")
    assert response.status_code == 200
    assert response.json()["message"] == "Team deleted"

    response = client.get("/team/")
    assert response.status_code == 400
    assert response.json()["detail"] == "User not in team"


def test_leave_team(client: TestClient):
    team_data = test_create_team(client)

    response = client.post("/team/leave")
    leave_data = response.json()

    assert response.status_code == 200
    assert leave_data == team_data
    return team_data


def test_join_team(client: TestClient):
    team_data = test_leave_team(client)

    response = client.post("/team/join", json={"name": team_data["name"]})
    join_data = response.json()

    assert response.status_code == 200
    assert join_data == team_data
