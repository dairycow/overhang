import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


@pytest.fixture(scope="function")
def test_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    yield TestingSessionLocal

    engine.dispose()


@pytest.fixture(scope="function")
def client(test_db):
    pass


@pytest.fixture(scope="function")
def test_user(test_db):
    pass


@pytest.fixture(scope="function")
def test_token(test_user):
    pass
