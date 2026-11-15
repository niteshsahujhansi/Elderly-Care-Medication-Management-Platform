import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is in search path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.utils.seeder import seed_database

@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    """Ensure database tables and initial demo users exist."""
    seed_database()

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

@pytest.fixture(scope="session")
def sarah_headers(client):
    res = client.post("/api/auth/demo-login/sarah")
    assert res.status_code == 200, "Demo login as Sarah failed"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def robert_headers(client):
    res = client.post("/api/auth/demo-login/grandpa")
    assert res.status_code == 200, "Demo login as Grandpa Robert failed"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def elena_headers(client):
    res = client.post("/api/auth/demo-login/elena")
    assert res.status_code == 200, "Demo login as Nurse Elena failed"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def tom_headers(client):
    res = client.post("/api/auth/demo-login/tom")
    assert res.status_code == 200, "Demo login as Neighbor Tom failed"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def profile_ids(client, sarah_headers):
    res = client.get("/api/profiles/my", headers=sarah_headers)
    assert res.status_code == 200
    profiles = res.json()
    robert = next(p for p in profiles if "Robert" in p["name"])
    alice = next(p for p in profiles if "Alice" in p["name"])
    return {
        "robert_id": robert["profile_id"],
        "alice_id": alice["profile_id"],
    }
