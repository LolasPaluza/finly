from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token():
    client.post("/auth/register", json={"email": "dash@finly.com", "password": "senha123", "name": "Dash"})
    r = client.post("/auth/login", json={"email": "dash@finly.com", "password": "senha123"})
    return r.json()["access_token"]

def test_dashboard_returns_structure():
    token = get_token()
    r = client.get("/dashboard?month=2026-04", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert "income" in data
    assert "expenses" in data
    assert "available" in data
    assert "saved" in data
    assert "by_category" in data
    assert "alerts" in data
    assert "suggestions" in data

def test_chat_returns_reply():
    token = get_token()
    r = client.post("/chat", json={"message": "quanto gastei?"}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert "reply" in r.json()
