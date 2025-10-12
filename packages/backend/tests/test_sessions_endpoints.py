from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Location

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


@pytest.fixture
def auth_token():
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )
    return response.json()["access_token"]


def test_create_session_success(auth_token):
    response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "grade": "V3",
            "date": str(date.today()),
            "attempts": 3,
            "completed": True,
            "rating": 8,
            "notes": "Great climb!",
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["grade"] == "V3"
    assert data["attempts"] == 3
    assert data["completed"] is True
    assert data["rating"] == 8


def test_create_session_invalid_location(auth_token):
    response = client.post(
        "/sessions",
        json={
            "location_id": 999,
            "grade": "V3",
            "date": str(date.today()),
            "attempts": 3,
            "completed": True,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 400


def test_create_session_unauthenticated():
    response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "grade": "V3",
            "date": str(date.today()),
            "attempts": 3,
            "completed": True,
        },
    )
    assert response.status_code == 401


def test_get_sessions(auth_token):
    client.post(
        "/sessions",
        json={
            "location_id": 1,
            "grade": "V3",
            "date": str(date.today()),
            "attempts": 3,
            "completed": True,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    
    response = client.get(
        "/sessions", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["grade"] == "V3"


def test_get_sessions_with_filters(auth_token):
    yesterday = date.today() - timedelta(days=1)
    
    client.post(
        "/sessions",
        json={
            "location_id": 1,
            "grade": "V3",
            "date": str(yesterday),
            "attempts": 3,
            "completed": True,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    
    response = client.get(
        f"/sessions?start_date={yesterday}&end_date={date.today()}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_session_by_id(auth_token):
    create_response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "grade": "V3",
            "date": str(date.today()),
            "attempts": 3,
            "completed": True,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    session_id = create_response.json()["id"]
    
    response = client.get(
        f"/sessions/{session_id}", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert response.json()["id"] == session_id


def test_get_session_not_found(auth_token):
    response = client.get(
        "/sessions/999", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 404


def test_update_session(auth_token):
    create_response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "grade": "V3",
            "date": str(date.today()),
            "attempts": 3,
            "completed": False,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    session_id = create_response.json()["id"]
    
    response = client.put(
        f"/sessions/{session_id}",
        json={"completed": True, "rating": 9},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True
    assert data["rating"] == 9


def test_update_session_not_found(auth_token):
    response = client.put(
        "/sessions/999",
        json={"completed": True},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 404


def test_delete_session(auth_token):
    create_response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "grade": "V3",
            "date": str(date.today()),
            "attempts": 3,
            "completed": True,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    session_id = create_response.json()["id"]
    
    response = client.delete(
        f"/sessions/{session_id}", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 204
    
    get_response = client.get(
        f"/sessions/{session_id}", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert get_response.status_code == 404


def test_delete_session_not_found(auth_token):
    response = client.delete(
        "/sessions/999", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 404
