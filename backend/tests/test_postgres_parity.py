import os
from datetime import date

import pytest


@pytest.fixture()
def postgres_app():
    db_url = os.getenv("POSTGRES_TEST_DATABASE_URL")
    if not db_url:
        pytest.skip("POSTGRES_TEST_DATABASE_URL not set; postgres parity tests are CI-only")

    os.environ["DATABASE_URL"] = db_url
    os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
    os.environ.setdefault("GOOGLE_CLIENT_ID", "test-google-client-id")
    os.environ.setdefault("APPLE_CLIENT_ID", "test-apple-client-id")

    from app import create_app, db

    app = create_app()
    app.config.update({"TESTING": True, "RATELIMIT_ENABLED": False})

    with app.app_context():
        db.drop_all()
        db.create_all()

    yield app

    with app.app_context():
        db.drop_all()


@pytest.fixture()
def postgres_client(postgres_app):
    return postgres_app.test_client()


def _register_and_login(client, email="postgres@example.com", password="Password1"):
    client.post("/api/auth/register", json={"email": email, "password": password})
    rv = client.post("/api/auth/login", json={"email": email, "password": password})
    token = rv.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.postgres
def test_postgres_weekly_days_of_week_roundtrip(postgres_client):
    headers = _register_and_login(postgres_client)

    create = postgres_client.post(
        "/api/habits/",
        headers=headers,
        json={
            "name": "Weekly Postgres Habit",
            "start_date": date.today().isoformat(),
            "frequency": "WEEKLY",
            "days_of_week": [0, 2, 4],
        },
    )
    assert create.status_code == 200

    listed = postgres_client.get("/api/habits/", headers=headers)
    assert listed.status_code == 200
    rows = listed.get_json()
    assert rows[0]["frequency"] == "WEEKLY"
    assert rows[0]["days_of_week"] == [0, 2, 4]


@pytest.mark.postgres
def test_postgres_calendar_summary_endpoint(postgres_client):
    headers = _register_and_login(postgres_client, email="calendarpg@example.com")
    postgres_client.post(
        "/api/habits/",
        headers=headers,
        json={"name": "Daily PG", "start_date": date.today().isoformat(), "frequency": "DAILY"},
    )

    month = date.today().strftime("%Y-%m")
    rv = postgres_client.get(f"/api/habits/calendar-summary?month={month}", headers=headers)
    assert rv.status_code == 200
    assert isinstance(rv.get_json(), dict)
