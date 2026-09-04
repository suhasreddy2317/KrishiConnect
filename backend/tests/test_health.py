from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify that GET /api/health returns 200 and healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "KrishiConnect API"
    assert data["version"] == "0.1.0"
    assert data["database"] == "connected"


def test_root_endpoint():
    """Verify that root / endpoint returns welcome information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "health_endpoint" in data

