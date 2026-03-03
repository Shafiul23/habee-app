import os
import tempfile

import pytest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

TEST_ENV_DEFAULTS = {
    "JWT_SECRET_KEY": "test-secret",
    "GOOGLE_CLIENT_ID": "test-google-client-id",
    "APPLE_CLIENT_ID": "test-apple-client-id",
}


def _set_test_env_defaults():
    for key, value in TEST_ENV_DEFAULTS.items():
        os.environ.setdefault(key, value)


_set_test_env_defaults()


@pytest.fixture()
def app():
    db_fd, db_path = tempfile.mkstemp()
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
    _set_test_env_defaults()

    from app.config import Config

    Config.SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
    Config.SQLALCHEMY_ENGINE_OPTIONS = {}

    from app import create_app, db
    from app.models.habit import Habit

    app = create_app()
    app.config.update({
        "TESTING": True,
        "RATELIMIT_ENABLED": False,
    })
    with app.app_context():
        # Replace ARRAY column with PickleType for SQLite
        Habit.__table__.columns["days_of_week"].type = db.PickleType()
        db.create_all()
    yield app
    with app.app_context():
        db.drop_all()
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def register_user(client):
    def _register(email="test@example.com", password="Password1"):
        return client.post(
            "/api/auth/register",
            json={"email": email, "password": password},
        )

    return _register


@pytest.fixture()
def login_user(client, register_user):
    def _login(email="test@example.com", password="Password1", register=True):
        if register:
            register_user(email=email, password=password)
        return client.post(
            "/api/auth/login",
            json={"email": email, "password": password},
        )

    return _login


@pytest.fixture()
def auth_headers(login_user):
    def _headers(email="test@example.com", password="Password1", register=True):
        rv = login_user(email=email, password=password, register=register)
        token = rv.get_json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _headers
