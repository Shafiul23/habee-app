import os
import tempfile
import pytest


@pytest.fixture()
def app():
    db_fd, db_path = tempfile.mkstemp()
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
    os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
    from app import create_app, db
    from app.models.habit import Habit
    app = create_app()
    app.config.update({
        "TESTING": True,
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
