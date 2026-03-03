from datetime import datetime, timedelta
from unittest.mock import patch

import pytest

from app.extensions import db
from app.models.reset_token import PasswordResetToken
from app.models.user import User


@pytest.mark.integration
@pytest.mark.parametrize(
    "payload, expected_error",
    [
        ({}, "Email and password are required"),
        ({"email": "bad-email", "password": "Password1"}, "Invalid email address"),
        (
            {"email": "user@example.com", "password": "short"},
            "Password must be at least 6 characters, include 1 capital and 1 number",
        ),
    ],
)
def test_register_validation_errors(client, payload, expected_error):
    rv = client.post("/api/auth/register", json=payload)
    assert rv.status_code == 400
    assert rv.get_json()["error"] == expected_error


@pytest.mark.integration
def test_register_duplicate_email(client, register_user):
    rv1 = register_user("dup@example.com", "Password1")
    rv2 = register_user("dup@example.com", "Password1")

    assert rv1.status_code == 201
    assert rv2.status_code == 400
    assert rv2.get_json()["error"] == "User already exists"


@pytest.mark.integration
def test_login_success_and_invalid_credentials(client, register_user, login_user):
    register_user("login@example.com", "Password1")

    ok = login_user("login@example.com", "Password1", register=False)
    bad = login_user("login@example.com", "Wrongpass1", register=False)

    assert ok.status_code == 200
    assert "access_token" in ok.get_json()
    assert bad.status_code == 401
    assert bad.get_json()["error"] == "Invalid credentials"


@pytest.mark.integration
def test_delete_user_requires_token(client):
    rv = client.delete("/api/auth/delete")
    assert rv.status_code == 401


@pytest.mark.integration
def test_delete_user_success_and_not_found(client, auth_headers):
    headers = auth_headers("delete@example.com", "Password1")

    deleted = client.delete("/api/auth/delete", headers=headers)
    assert deleted.status_code == 200
    assert deleted.get_json()["message"] == "User deleted successfully"

    deleted_again = client.delete("/api/auth/delete", headers=headers)
    assert deleted_again.status_code == 404
    assert deleted_again.get_json()["error"] == "User not found"


@pytest.mark.integration
def test_google_login_missing_token(client):
    rv = client.post("/api/auth/google", json={})
    assert rv.status_code == 400
    assert rv.get_json()["error"] == "Token is required"


@pytest.mark.integration
def test_google_login_invalid_token(client):
    with patch("app.routes.auth.id_token.verify_oauth2_token", side_effect=Exception("bad")):
        rv = client.post("/api/auth/google", json={"token": "bad"})
    assert rv.status_code == 401
    assert rv.get_json()["error"] == "Invalid token"


@pytest.mark.integration
def test_google_login_missing_sub(client):
    with patch("app.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {"email": "google@example.com"}
        rv = client.post("/api/auth/google", json={"token": "valid"})

    assert rv.status_code == 401
    assert rv.get_json()["error"] == "Invalid token"


@pytest.mark.integration
def test_google_login_missing_email_for_new_user(client):
    with patch("app.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {"sub": "google123"}
        rv = client.post("/api/auth/google", json={"token": "valid"})

    assert rv.status_code == 400
    body = rv.get_json()
    assert body["error"] == "google_email_missing"


@pytest.mark.integration
def test_google_login_links_existing_email(client, register_user, app):
    register_user("google-link@example.com", "Password1")

    with patch("app.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "google-linked-sub",
            "email": "google-link@example.com",
        }
        rv = client.post("/api/auth/google", json={"token": "valid"})

    assert rv.status_code == 200
    assert "access_token" in rv.get_json()
    with app.app_context():
        user = User.query.filter_by(email="google-link@example.com").first()
        assert user is not None
        assert user.google_id == "google-linked-sub"


@pytest.mark.integration
def test_google_login_creates_new_user(client, app):
    with patch("app.routes.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {"sub": "google123", "email": "google@example.com"}
        rv = client.post("/api/auth/google", json={"token": "valid"})

    assert rv.status_code == 200
    assert "access_token" in rv.get_json()
    with app.app_context():
        user = User.query.filter_by(google_id="google123").first()
        assert user is not None
        assert user.email == "google@example.com"


@pytest.mark.integration
def test_apple_login_missing_token(client):
    rv = client.post("/api/auth/apple", json={})
    assert rv.status_code == 400
    assert rv.get_json()["error"] == "Token is required"


@pytest.mark.integration
def test_apple_login_invalid_token(client):
    with patch("app.routes.auth.PyJWKClient") as mock_jwk_client:
        mock_jwk_client.return_value.get_signing_key_from_jwt.side_effect = Exception("bad")
        rv = client.post("/api/auth/apple", json={"token": "bad"})

    assert rv.status_code == 401
    assert rv.get_json()["error"] == "Invalid token"


@pytest.mark.integration
def test_apple_login_missing_email_for_new_user(client):
    with patch("app.routes.auth.PyJWKClient") as mock_jwk_client, patch(
        "app.routes.auth.jwt.decode"
    ) as mock_decode:
        mock_jwk_client.return_value.get_signing_key_from_jwt.return_value.key = "fake-key"
        mock_decode.return_value = {"sub": "apple123"}
        rv = client.post("/api/auth/apple", json={"token": "valid"})

    assert rv.status_code == 400
    body = rv.get_json()
    assert body["error"] == "apple_email_missing"


@pytest.mark.integration
def test_apple_login_links_existing_email(client, register_user, app):
    register_user("apple-link@example.com", "Password1")

    with patch("app.routes.auth.PyJWKClient") as mock_jwk_client, patch(
        "app.routes.auth.jwt.decode"
    ) as mock_decode:
        mock_jwk_client.return_value.get_signing_key_from_jwt.return_value.key = "fake-key"
        mock_decode.return_value = {
            "sub": "apple-linked-sub",
            "email": "apple-link@example.com",
        }
        rv = client.post("/api/auth/apple", json={"token": "valid"})

    assert rv.status_code == 200
    with app.app_context():
        user = User.query.filter_by(email="apple-link@example.com").first()
        assert user is not None
        assert user.apple_id == "apple-linked-sub"


@pytest.mark.integration
def test_forgot_password_unknown_email_does_not_create_token(client, app):
    rv = client.post("/api/auth/forgot-password", json={"email": "missing@example.com"})
    assert rv.status_code == 200
    assert rv.get_json()["message"] == "If this email exists, a reset link will be sent."

    with app.app_context():
        assert PasswordResetToken.query.count() == 0


@pytest.mark.integration
def test_password_reset_lifecycle(client, register_user, app):
    register_user("reset@example.com", "Password1")

    with patch("app.routes.auth.send_email_smtp") as mock_email:
        forgot = client.post("/api/auth/forgot-password", json={"email": "reset@example.com"})
    assert forgot.status_code == 200
    mock_email.assert_called_once()

    with app.app_context():
        token_entry = PasswordResetToken.query.first()
        assert token_entry is not None
        token = token_entry.token

    validate = client.get(f"/api/auth/validate-reset-token/{token}")
    assert validate.status_code == 200
    assert validate.get_json()["message"] == "Valid token"

    reset = client.post(f"/api/auth/reset-password/{token}", json={"password": "Newpass1"})
    assert reset.status_code == 200
    assert reset.get_json()["message"] == "Password updated successfully"

    reuse = client.post(f"/api/auth/reset-password/{token}", json={"password": "Another1"})
    assert reuse.status_code == 400
    assert reuse.get_json()["error"] == "Invalid or expired token"

    login_old = client.post(
        "/api/auth/login", json={"email": "reset@example.com", "password": "Password1"}
    )
    login_new = client.post(
        "/api/auth/login", json={"email": "reset@example.com", "password": "Newpass1"}
    )
    assert login_old.status_code == 401
    assert login_new.status_code == 200


@pytest.mark.integration
def test_validate_and_reset_reject_expired_token(client, register_user, app):
    register_user("expired@example.com", "Password1")

    with app.app_context():
        user = User.query.filter_by(email="expired@example.com").first()
        assert user is not None
        token = PasswordResetToken(
            user_id=user.id,
            token="expired-token",
            expires_at=datetime.utcnow() - timedelta(hours=1),
        )
        db.session.add(token)
        db.session.commit()

    validate = client.get("/api/auth/validate-reset-token/expired-token")
    reset = client.post("/api/auth/reset-password/expired-token", json={"password": "Newpass1"})
    assert validate.status_code == 400
    assert reset.status_code == 400
    assert validate.get_json()["error"] == "Invalid or expired token"
    assert reset.get_json()["error"] == "Invalid or expired token"
