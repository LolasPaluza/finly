import pytest
from fastapi.testclient import TestClient
from app.main import app
import io

client = TestClient(app)

def get_auth_token():
    client.post("/auth/register", json={
        "email": "upload@finly.com", "password": "senha123", "name": "Upload User"
    })
    r = client.post("/auth/login", json={"email": "upload@finly.com", "password": "senha123"})
    return r.json()["access_token"]

def test_upload_csv():
    token = get_auth_token()
    csv_content = b"Data,Descricao,Valor\n2026-04-01,iFood,-45.00\n2026-04-02,Salario,5000.00\n"
    response = client.post(
        "/transactions/upload",
        files={"file": ("extrato.csv", io.BytesIO(csv_content), "text/csv")},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["imported"] == 2

def test_list_transactions():
    token = get_auth_token()
    response = client.get(
        "/transactions?month=2026-04",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
