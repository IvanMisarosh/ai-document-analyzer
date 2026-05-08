import os
import pytest
from unittest.mock import Mock

# Set required env vars before any app module is imported.
# pydantic-settings instantiates Settings() at import time, so these must
# be present in os.environ before the first `import app.*`.
_TEST_ENV = {
    "DATABASE_URL": "postgresql://test:test@localhost:5432/test",
    "GOOGLE_API_KEY": "fake-key-for-tests",
    "CELERY_BROKER_URL": "redis://localhost:6379/0",
    "CELERY_RESULT_BACKEND": "redis://localhost:6379/0",
    "SECRET_KEY": "test-secret-key-not-for-production-use-at-least-32ch",
    "REDIS_URL": "redis://localhost:6379/0",
    "MINIO_ENDPOINT": "localhost:9000",
    "MINIO_ACCESS_KEY": "minioadmin",
    "MINIO_SECRET_KEY": "minioadmin",
}
for key, value in _TEST_ENV.items():
    os.environ.setdefault(key, value)

from app.analyzer.pdf_parser import PDFParser  # noqa: E402
from app.auth.service import AuthService  # noqa: E402
from app.auth import schemas  # noqa: E402
from app import models  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402


@pytest.fixture
def parser():
    """Standard parser instance for testing."""
    return PDFParser(min_chapter_lenght=50, max_chapter_heading_lenght=80, max_words_per_heading=4)


@pytest.fixture
def mock_doc():
    """Mock PDF document for testing."""
    mock_doc = Mock()
    mock_doc.__len__ = Mock(return_value=2)  # 2 pages
    mock_doc.__iter__ = Mock(return_value=iter([Mock(), Mock()]))
    return mock_doc


@pytest.fixture
def auth_service():
    """Create AuthService instance for testing."""
    return AuthService()


@pytest.fixture
def mock_db():
    """Create mock database session."""
    return Mock(spec=Session)


@pytest.fixture
def sample_user():
    """Create a sample user for testing."""
    return models.User(
        id=1,
        username="testuser",
        hashed_password="$2b$12$hash"  # Mock bcrypt hash
    )


@pytest.fixture
def user_create_data():
    """Create sample user creation data."""
    return schemas.UserCreate(
        username="newuser",
        password="password123"
    )
