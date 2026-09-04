"""Pytest configuration and shared fixtures."""
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.session import Base
from app.main import app


# Use a separate test database to avoid polluting development data
TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "test.db")
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create a clean test database schema once per test session."""
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    engine.dispose()
    yield
    try:
        if os.path.exists(TEST_DB_PATH):
            os.remove(TEST_DB_PATH)
    except PermissionError:
        pass


@pytest.fixture()
def db() -> Session:
    """Provide a clean database session for each test."""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestSession()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client() -> TestClient:
    """Provide a FastAPI test client."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_development_database():
    """Truncate all tables in the development database before each test to ensure isolation."""
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            for table in reversed(Base.metadata.sorted_tables):
                conn.execute(text(f"DELETE FROM {table.name}"))
            trans.commit()
        except Exception:
            trans.rollback()
            raise
    engine.dispose()
    yield
