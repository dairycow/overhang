from datetime import date, timedelta

import pytest


@pytest.fixture
def auth_token(client):
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )
    return response.json()["access_token"]


def test_create_session_success(client, auth_token):
    response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "grades": [{"grade": "V3", "attempts": 3, "completed": 2}],
            "rating": 8,
            "notes": "Great climb!",
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["grades"]) == 1
    assert data["grades"][0]["grade"] == "V3"
    assert data["grades"][0]["attempts"] == 3
    assert data["grades"][0]["completed"] == 2
    assert data["rating"] == 8


def test_create_session_invalid_location(client, auth_token):
    response = client.post(
        "/sessions",
        json={
            "location_id": 999,
            "date": str(date.today()),
            "grades": [{"grade": "V3", "attempts": 3, "completed": 2}],
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 400


def test_create_session_unauthenticated(client):
    response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "grades": [{"grade": "V3", "attempts": 3, "completed": 2}],
        },
    )
    assert response.status_code == 401


def test_create_session_with_zero_attempts(client, auth_token):
    response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "grades": [{"grade": "V3", "attempts": 0, "completed": 1}],
            "rating": 7,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["grades"]) == 1
    assert data["grades"][0]["grade"] == "V3"
    assert data["grades"][0]["attempts"] == 0
    assert data["grades"][0]["completed"] == 1


def test_get_sessions(client, auth_token):
    client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "grades": [{"grade": "V3", "attempts": 3, "completed": 2}],
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    response = client.get(
        "/sessions", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["grades"][0]["grade"] == "V3"


def test_get_sessions_with_filters(client, auth_token):
    yesterday = date.today() - timedelta(days=1)

    client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(yesterday),
            "grades": [{"grade": "V3", "attempts": 3, "completed": 2}],
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    response = client.get(
        f"/sessions?start_date={yesterday}&end_date={date.today()}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_session_by_id(client, auth_token):
    create_response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "grades": [{"grade": "V3", "attempts": 3, "completed": 2}],
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    session_id = create_response.json()["id"]

    response = client.get(
        f"/sessions/{session_id}", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert response.json()["id"] == session_id


def test_get_session_not_found(client, auth_token):
    response = client.get(
        "/sessions/999", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 404


def test_update_session(client, auth_token):
    create_response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "grades": [{"grade": "V3", "attempts": 3, "completed": 1}],
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    session_id = create_response.json()["id"]

    response = client.put(
        f"/sessions/{session_id}",
        json={
            "grades": [{"grade": "V3", "attempts": 3, "completed": 2}],
            "rating": 9,
        },
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["grades"][0]["completed"] == 2
    assert data["rating"] == 9


def test_update_session_not_found(client, auth_token):
    response = client.put(
        "/sessions/999",
        json={"completed": True},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 404


def test_delete_session(client, auth_token):
    create_response = client.post(
        "/sessions",
        json={
            "location_id": 1,
            "date": str(date.today()),
            "grades": [{"grade": "V3", "attempts": 3, "completed": 2}],
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


def test_delete_session_not_found(client, auth_token):
    response = client.delete(
        "/sessions/999", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 404
