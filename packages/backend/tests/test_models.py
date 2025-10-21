from datetime import date, datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.database import Base
from src.models import Location, Problem, Session, User


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


def test_create_location(db_session):
    location = Location(name="Test Gym", slug="test-gym")
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)

    assert location.id is not None
    assert location.name == "Test Gym"
    assert location.slug == "test-gym"
    assert isinstance(location.created_at, datetime)


def test_location_unique_name(db_session):
    location1 = Location(name="Test Gym", slug="test-gym")
    db_session.add(location1)
    db_session.commit()

    location2 = Location(name="Test Gym", slug="test-gym-2")
    db_session.add(location2)

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_create_user(db_session):
    location = Location(name="Test Gym", slug="test-gym")
    db_session.add(location)
    db_session.commit()

    user = User(
        username="testuser",
        password_hash="hashed_password",
        home_location_id=location.id,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.username == "testuser"
    assert user.password_hash == "hashed_password"
    assert user.home_location_id == location.id
    assert isinstance(user.created_at, datetime)


def test_user_relationship_with_location(db_session):
    location = Location(name="Test Gym", slug="test-gym")
    db_session.add(location)
    db_session.commit()

    user = User(
        username="testuser",
        password_hash="hashed_password",
        home_location_id=location.id,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.home_location.name == "Test Gym"


def test_create_session(db_session):
    location = Location(name="Test Gym", slug="test-gym")
    db_session.add(location)
    db_session.commit()

    user = User(
        username="testuser",
        password_hash="hashed_password",
        home_location_id=location.id,
    )
    db_session.add(user)
    db_session.commit()

    session = Session(
        user_id=user.id,
        location_id=location.id,
        date=date.today(),
        rating=8,
    )
    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)

    # Add a problem to the session
    problem = Problem(
        session_id=session.id,
        grade="V3",
        attempts=3,
        sends=2,
        notes="Great climb!",
    )
    db_session.add(problem)
    db_session.commit()
    db_session.refresh(session)

    assert session.id is not None
    assert session.user_id == user.id
    assert session.location_id == location.id
    assert len(session.problems) == 1
    assert session.problems[0].grade == "V3"
    assert session.problems[0].attempts == 3
    assert session.problems[0].sends == 2
    assert session.rating == 8
    assert session.problems[0].notes == "Great climb!"


def test_session_relationships(db_session):
    location = Location(name="Test Gym", slug="test-gym")
    db_session.add(location)
    db_session.commit()

    user = User(
        username="testuser",
        password_hash="hashed_password",
        home_location_id=location.id,
    )
    db_session.add(user)
    db_session.commit()

    session = Session(
        user_id=user.id,
        location_id=location.id,
        date=date.today(),
    )
    db_session.add(session)
    db_session.commit()

    # Add a problem
    problem = Problem(
        session_id=session.id,
        grade="V3",
        attempts=3,
        sends=2,
    )
    db_session.add(problem)
    db_session.commit()
    db_session.refresh(session)

    assert session.user.username == "testuser"
    assert session.location.name == "Test Gym"
    assert len(user.sessions) == 1
    assert user.sessions[0].problems[0].grade == "V3"
