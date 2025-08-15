from flask import json


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
