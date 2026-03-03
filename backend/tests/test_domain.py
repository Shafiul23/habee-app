from datetime import date, timedelta
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from sqlalchemy.exc import OperationalError

import app.extensions as ext
import app.routes.auth as auth_routes
from app.routes.habits import is_applicable


def _habit(
    *,
    start_date_value: date,
    frequency: str = "DAILY",
    days_of_week=None,
    pauses=None,
):
    return SimpleNamespace(
        start_date=start_date_value,
        frequency=frequency,
        days_of_week=days_of_week,
        pauses=pauses or [],
    )


@pytest.mark.unit
@pytest.mark.parametrize(
    "start_offset, expected",
    [
        (0, True),   # start date is applicable
        (1, False),  # before start date
        (-1, True),  # after start date
    ],
)
def test_is_applicable_start_date_boundary(start_offset, expected):
    today = date.today()
    habit = _habit(start_date_value=today)
    check = today - timedelta(days=start_offset)
    assert is_applicable(habit, check) is expected


@pytest.mark.unit
def test_is_applicable_weekly_days_of_week_mapping():
    monday = date(2026, 1, 5)  # Monday
    tuesday = monday + timedelta(days=1)

    weekly = _habit(start_date_value=monday, frequency="WEEKLY", days_of_week=[0, 2, 4])
    assert is_applicable(weekly, monday) is True
    assert is_applicable(weekly, tuesday) is False


@pytest.mark.unit
def test_is_applicable_excludes_open_and_closed_pauses():
    today = date.today()
    pause = SimpleNamespace(start_date=today - timedelta(days=1), end_date=None)
    habit = _habit(start_date_value=today - timedelta(days=30), pauses=[pause])
    assert is_applicable(habit, today) is False

    ended_pause = SimpleNamespace(
        start_date=today - timedelta(days=10), end_date=today - timedelta(days=2)
    )
    habit_with_old_pause = _habit(start_date_value=today - timedelta(days=30), pauses=[ended_pause])
    assert is_applicable(habit_with_old_pause, today) is True


@pytest.mark.unit
def test_retry_on_operational_error_retries_once(monkeypatch):
    rollback = Mock()
    dispose = Mock()
    fake_db = SimpleNamespace(
        session=SimpleNamespace(rollback=rollback),
        engine=SimpleNamespace(dispose=dispose),
    )
    monkeypatch.setattr(auth_routes, "db", fake_db)

    attempts = {"count": 0}

    @auth_routes.retry_on_operational_error
    def flaky():
        attempts["count"] += 1
        if attempts["count"] == 1:
            raise OperationalError("SELECT 1", {}, Exception("db down"))
        return "ok"

    assert flaky() == "ok"
    assert attempts["count"] == 2
    assert rollback.call_count == 1
    dispose.assert_called_once()


@pytest.mark.unit
def test_retry_on_operational_error_returns_503_after_second_failure(app, monkeypatch):
    rollback = Mock()
    dispose = Mock()
    fake_db = SimpleNamespace(
        session=SimpleNamespace(rollback=rollback),
        engine=SimpleNamespace(dispose=dispose),
    )
    monkeypatch.setattr(auth_routes, "db", fake_db)

    @auth_routes.retry_on_operational_error
    def always_fails():
        raise OperationalError("SELECT 1", {}, Exception("db down"))

    with app.app_context():
        response, status = always_fails()

    assert status == 503
    assert response.get_json()["error"] == "database_unavailable"
    assert rollback.call_count == 2
    dispose.assert_called_once()


@pytest.mark.unit
def test_rate_limit_key_prefers_jwt_identity(monkeypatch):
    monkeypatch.setattr(ext, "verify_jwt_in_request", lambda optional=True: None)
    monkeypatch.setattr(ext, "get_jwt_identity", lambda: "user-123")
    monkeypatch.setattr(ext, "get_remote_address", lambda: "1.2.3.4")
    assert ext.rate_limit_key() == "user-123"


@pytest.mark.unit
def test_rate_limit_key_falls_back_to_ip(monkeypatch):
    def raise_auth_error(optional=True):
        raise RuntimeError("no auth")

    monkeypatch.setattr(ext, "verify_jwt_in_request", raise_auth_error)
    monkeypatch.setattr(ext, "get_remote_address", lambda: "5.6.7.8")
    assert ext.rate_limit_key() == "5.6.7.8"
