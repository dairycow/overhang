from datetime import timedelta

import pytest
from src.auth import (
    authenticate_user,
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from src.database import Base
from src.models import Location, User
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    yield session

    session.close()


@pytest.fixture
def test_location(db_session):
    location = Location(name="Test Gym", slug="test-gym")
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)
    return location


@pytest.fixture
def test_user(db_session, test_location):
    password = "testpassword123"
    user = User(
        username="testuser",
        password_hash=get_password_hash(password),
        home_location_id=test_location.id,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    user.plain_password = password
    return user


def test_password_hashing():
    password = "testpassword123"
    hashed = get_password_hash(password)

    assert hashed != password
    assert len(hashed) > 20


def test_verify_password():
    password = "testpassword123"
    hashed = get_password_hash(password)

    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_create_access_token():
    data = {"sub": "testuser"}
    token = create_access_token(data)

    assert isinstance(token, str)
    assert len(token) > 20


def test_create_access_token_with_expires():
    data = {"sub": "testuser"}
    token = create_access_token(data, expires_delta=timedelta(minutes=15))

    assert isinstance(token, str)
    assert len(token) > 20


def test_decode_access_token():
    data = {"sub": "testuser"}
    token = create_access_token(data)

    token_data = decode_access_token(token)

    assert token_data is not None
    assert token_data.username == "testuser"


def test_decode_invalid_token():
    token_data = decode_access_token("invalid_token")

    assert token_data is None


def test_decode_token_missing_sub():
    data = {"user": "testuser"}
    token = create_access_token(data)

    token_data = decode_access_token(token)

    assert token_data is None


def test_authenticate_user_success(db_session, test_user):
    authenticated_user = authenticate_user(
        db_session, test_user.username, test_user.plain_password
    )

    assert authenticated_user is not None
    assert authenticated_user.username == test_user.username
    assert authenticated_user.id == test_user.id


def test_authenticate_user_wrong_password(db_session, test_user):
    authenticated_user = authenticate_user(
        db_session, test_user.username, "wrongpassword"
    )

    assert authenticated_user is None


def test_authenticate_user_nonexistent(db_session):
    authenticated_user = authenticate_user(db_session, "nonexistent", "password")

    assert authenticated_user is None


def test_authenticate_user_case_sensitive(db_session, test_user):
    authenticated_user = authenticate_user(
        db_session, test_user.username.upper(), test_user.plain_password
    )

    assert authenticated_user is None
