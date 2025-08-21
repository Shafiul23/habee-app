from flask import json
from unittest.mock import patch


def register(client, email="test@example.com", password="Password1"):
    return client.post(
        "/api/auth/register",
        json={"email": email, "password": password},
    )


def login(client, email="test@example.com", password="Password1"):
    return client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )


def test_register_and_login(client):
    rv = register(client)
    assert rv.status_code == 201
    rv = login(client)
    assert rv.status_code == 200
    data = rv.get_json()
    assert "access_token" in data


def test_google_login_creates_user(client, app):
    with patch("app.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {"sub": "google123", "email": "google@example.com"}
        rv = client.post("/api/auth/google", json={"token": "valid"})
    assert rv.status_code == 200
    data = rv.get_json()
    assert "access_token" in data
    from app.models.user import User
    with app.app_context():
        user = User.query.filter_by(google_id="google123").first()
        assert user is not None
        assert user.email == "google@example.com"
