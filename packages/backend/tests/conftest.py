import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.database import Base, get_db
from src.main import app
# Import all models to ensure they're registered with Base.metadata
from src.models import Location, User, Session  # noqa: F401


@pytest.fixture(scope="session")
def test_engine():
    """Create a test database engine that's shared across all tests."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    yield engine
    engine.dispose()


@pytest.fixture(scope="session")
def TestingSessionLocal(test_engine):
    """Create a session factory."""
    return sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function", autouse=True)
def setup_database(test_engine, TestingSessionLocal):
    """Setup and teardown database for each test function."""
    # Create all tables
    Base.metadata.create_all(bind=test_engine)

    # Setup test data
    db = TestingSessionLocal()
    location = Location(name="Test Gym", slug="test-gym")
    db.add(location)
    db.commit()
    db.close()

    # Override the dependency
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield

    # Cleanup
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client():
    """Create a test client."""
    return TestClient(app)
