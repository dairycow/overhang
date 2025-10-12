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


def test_get_locations():
    response = client.get("/locations/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Gym"


def test_get_location_by_slug():
    response = client.get("/locations/test-gym")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "test-gym"
    assert data["name"] == "Test Gym"


def test_get_location_not_found():
    response = client.get("/locations/nonexistent")
    assert response.status_code == 404


def test_user_progress(auth_token):
    from datetime import date
    
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
        "/stats/user/progress", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["grade"] == "V3"


def test_user_distribution(auth_token):
    from datetime import date
    
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
        "/stats/user/distribution", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "V3" in data
    assert data["V3"] >= 1


def test_location_stats(auth_token):
    from datetime import date
    
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
    
    response = client.get("/stats/location/1")
    assert response.status_code == 200
    data = response.json()
    assert "total_climbs" in data
    assert data["total_climbs"] >= 1


def test_aggregate_stats(auth_token):
    from datetime import date
    
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
    
    response = client.get("/stats/aggregate")
    assert response.status_code == 200
    data = response.json()
    assert "total_climbs" in data
    assert data["total_climbs"] >= 1
    assert "by_location" in data
    assert "grade_distribution" in data
