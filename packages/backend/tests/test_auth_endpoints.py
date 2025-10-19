def test_register_success(client):
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_username(client):
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


def test_register_invalid_location(client):
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


def test_register_offensive_username(client):
    response = client.post(
        "/auth/register",
        json={
            "username": "fuck",
            "password": "password123",
            "home_location_id": 1,
        },
    )
    assert response.status_code == 422
    assert "inappropriate language" in str(response.json())


def test_login_success(client):
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


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={"username": "testuser", "password": "password123", "home_location_id": 1},
    )

    response = client.post(
        "/auth/login", data={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]


def test_login_nonexistent_user(client):
    response = client.post(
        "/auth/login", data={"username": "nonexistent", "password": "password123"}
    )
    assert response.status_code == 401


def test_get_me_authenticated(client):
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


def test_get_me_unauthenticated(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_get_me_invalid_token(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == 401
