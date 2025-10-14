import pytest
from app.database import Base, get_db
from app.main import app
from app.models import Location
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    location = Location(name="Test Gym", slug="test-gym")
    db.add(location)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


def test_register_success():
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_username():
    client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )

    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password456", "home_location_id": 1},
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_register_invalid_location():
    response = client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "password": "password123",
            "home_location_id": 999,
        },
    )
    assert response.status_code == 400
    assert "Invalid home location" in response.json()["detail"]


def test_register_weak_password():
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "short", "home_location_id": 1},
    )
    assert response.status_code == 422


def test_register_short_username():
    response = client.post(
        "/auth/register",
        json={"username": "ab", "password": "password123", "home_location_id": 1},
    )
    assert response.status_code == 422


def test_login_success():
    client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )

    response = client.post(
        "/auth/login", data={"username": "testuser", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password():
    client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )

    response = client.post(
        "/auth/login", data={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]


def test_login_nonexistent_user():
    response = client.post(
        "/auth/login", data={"username": "nonexistent", "password": "password123"}
    )
    assert response.status_code == 401


def test_get_me_authenticated():
    register_response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )
    token = register_response.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data
    assert "home_location_id" in data


def test_get_me_unauthenticated():
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_get_me_invalid_token():
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == 401
