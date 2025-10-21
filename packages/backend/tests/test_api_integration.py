import pytest


@pytest.fixture
def auth_token(client):
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )
    return response.json()["access_token"]


def test_get_locations(client):
    response = client.get("/locations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Gym"


def test_get_location_by_slug(client):
    response = client.get("/locations/test-gym")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "test-gym"
    assert data["name"] == "Test Gym"


def test_get_location_not_found(client):
    response = client.get("/locations/nonexistent")
    assert response.status_code == 404


def test_user_progress(client, auth_token):
    from datetime import date

    client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "problems": [{"grade": "V3", "attempts": 3, "sends": 2}],
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


def test_user_distribution(client, auth_token):
    from datetime import date

    client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "problems": [{"grade": "V3", "attempts": 3, "sends": 2}],
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


def test_location_stats(client, auth_token):
    from datetime import date

    client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "problems": [{"grade": "V3", "attempts": 3, "sends": 2}],
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    response = client.get("/stats/location/1")
    assert response.status_code == 200
    data = response.json()
    assert "total_climbs" in data
    assert data["total_climbs"] >= 1


def test_aggregate_stats(client, auth_token):
    from datetime import date

    client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "problems": [{"grade": "V3", "attempts": 3, "sends": 2}],
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
