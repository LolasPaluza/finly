import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/auth/register", json={
        "email": "test@finly.com",
        "password": "senha123",
        "name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@finly.com"
    assert "id" in data

def test_login_user():
    client.post("/auth/register", json={
        "email": "login@finly.com",
        "password": "senha123",
        "name": "Login User"
    })
    response = client.post("/auth/login", json={
        "email": "login@finly.com",
        "password": "senha123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    response = client.post("/auth/login", json={
        "email": "login@finly.com",
        "password": "errada"
    })
    assert response.status_code == 401
