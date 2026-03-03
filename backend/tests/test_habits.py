from datetime import date, timedelta

import pytest

from app.extensions import db
from app.models.habit import Habit
from app.models.habit_pause import HabitPause
from app.models.user import User
from tests.helpers import create_habit


@pytest.mark.integration
def test_create_habit_and_log_and_daily_summary(client, auth_headers):
    headers = auth_headers()
    rv = create_habit(client, headers, name="Read")
    assert rv.status_code == 200
    habit_id = rv.get_json()["habit"]["id"]

    log = client.post(f"/api/habits/{habit_id}/log", headers=headers)
    assert log.status_code == 200
    assert log.get_json()["message"] == "Habit logged"

    today = date.today().isoformat()
    summary = client.get(f"/api/habits/daily-summary?date={today}", headers=headers)
    assert summary.status_code == 200
    data = summary.get_json()
    assert len(data) == 1
    assert data[0]["id"] == habit_id
    assert data[0]["status"] == "complete"
    assert data[0]["completed"] is True


@pytest.mark.integration
@pytest.mark.parametrize(
    "payload, expected_error",
    [
        ({"name": ""}, "Habit name is required"),
        ({"name": "x" * 65}, "Habit name cannot exceed 64 characters"),
        ({"name": "Read", "frequency": "MONTHLY"}, "Invalid frequency"),
        (
            {"name": "Read", "frequency": "WEEKLY", "days_of_week": []},
            "days_of_week must be a non-empty list",
        ),
        (
            {"name": "Read", "frequency": "WEEKLY", "days_of_week": ["A"]},
            "days_of_week must be integers",
        ),
        (
            {"name": "Read", "frequency": "WEEKLY", "days_of_week": [7]},
            "days_of_week must be between 0 and 6",
        ),
    ],
)
def test_create_habit_validation_errors(client, auth_headers, payload, expected_error):
    headers = auth_headers()
    rv = create_habit(client, headers, **payload)
    assert rv.status_code == 400
    assert rv.get_json()["error"] == expected_error


@pytest.mark.integration
def test_update_habit_validation_and_success(client, auth_headers):
    headers = auth_headers()
    created = create_habit(client, headers, name="Walk")
    habit_id = created.get_json()["habit"]["id"]

    bad = client.put(
        f"/api/habits/{habit_id}",
        headers=headers,
        json={"name": "Walk", "frequency": "WEEKLY", "days_of_week": []},
    )
    assert bad.status_code == 400
    assert bad.get_json()["error"] == "days_of_week must be a non-empty list"

    ok = client.put(
        f"/api/habits/{habit_id}",
        headers=headers,
        json={"name": "Walk Updated", "frequency": "WEEKLY", "days_of_week": [0, 2]},
    )
    assert ok.status_code == 200
    body = ok.get_json()["habit"]
    assert body["name"] == "Walk Updated"
    assert body["frequency"] == "WEEKLY"
    assert body["days_of_week"] == [0, 2]


@pytest.mark.integration
def test_duplicate_name_active_and_archived_semantics(client, auth_headers):
    headers = auth_headers()
    active = create_habit(client, headers, name="Stretch")
    habit_id = active.get_json()["habit"]["id"]

    dup_active = create_habit(client, headers, name="stretch")
    assert dup_active.status_code == 409
    assert dup_active.get_json()["error"] == "duplicate_name_active"

    archived = client.post(f"/api/habits/{habit_id}/archive", headers=headers)
    assert archived.status_code == 200

    dup_archived = create_habit(client, headers, name="stretch")
    assert dup_archived.status_code == 409
    body = dup_archived.get_json()
    assert body["error"] == "duplicate_name_archived"
    assert body["archivedHabitId"] == habit_id


@pytest.mark.integration
def test_delete_habit_success_and_not_found(client, auth_headers):
    headers = auth_headers()
    created = create_habit(client, headers, name="Delete Me")
    habit_id = created.get_json()["habit"]["id"]

    deleted = client.delete(f"/api/habits/{habit_id}", headers=headers)
    assert deleted.status_code == 200

    missing = client.delete(f"/api/habits/{habit_id}", headers=headers)
    assert missing.status_code == 404
    assert missing.get_json()["error"] == "Habit not found"


@pytest.mark.integration
def test_archive_and_unarchive_flow(client, auth_headers):
    headers = auth_headers()
    created = create_habit(client, headers, name="Archive Me")
    habit_id = created.get_json()["habit"]["id"]

    archived = client.post(f"/api/habits/{habit_id}/archive", headers=headers)
    assert archived.status_code == 200

    archived_list = client.get("/api/habits/archived", headers=headers)
    assert archived_list.status_code == 200
    rows = archived_list.get_json()
    assert len(rows) == 1
    assert rows[0]["id"] == habit_id
    assert rows[0]["pause_start_date"] is not None

    unarchived = client.post(f"/api/habits/{habit_id}/unarchive", headers=headers)
    assert unarchived.status_code == 200

    archived_list_again = client.get("/api/habits/archived", headers=headers)
    assert archived_list_again.status_code == 200
    assert archived_list_again.get_json() == []


@pytest.mark.integration
def test_log_and_unlog_idempotency(client, auth_headers):
    headers = auth_headers()
    created = create_habit(client, headers, name="Journal")
    habit_id = created.get_json()["habit"]["id"]
    today = date.today().isoformat()

    first = client.post(f"/api/habits/{habit_id}/log", headers=headers, json={"date": today})
    second = client.post(f"/api/habits/{habit_id}/log", headers=headers, json={"date": today})
    assert first.status_code == 200
    assert second.status_code == 200
    assert second.get_json()["message"] == "Habit already logged for this date"

    unlog = client.post(f"/api/habits/{habit_id}/unlog", headers=headers, json={"date": today})
    unlog_again = client.post(
        f"/api/habits/{habit_id}/unlog", headers=headers, json={"date": today}
    )
    assert unlog.status_code == 200
    assert unlog_again.status_code == 404
    assert unlog_again.get_json()["message"] == "No log found for this date"


@pytest.mark.integration
def test_log_unlog_reject_invalid_and_unscheduled_dates(client, auth_headers):
    headers = auth_headers()
    created = create_habit(
        client,
        headers,
        name="Weekly Habit",
        frequency="WEEKLY",
        days_of_week=[0],
    )
    habit_id = created.get_json()["habit"]["id"]

    bad = client.post(f"/api/habits/{habit_id}/log", headers=headers, json={"date": "not-a-date"})
    assert bad.status_code == 400
    assert bad.get_json()["error"] == "Invalid date format. Use YYYY-MM-DD"

    today = date.today()
    not_monday = today
    while not_monday.weekday() == 0:
        not_monday += timedelta(days=1)

    unscheduled = client.post(
        f"/api/habits/{habit_id}/log",
        headers=headers,
        json={"date": not_monday.isoformat()},
    )
    assert unscheduled.status_code == 400
    assert unscheduled.get_json()["error"] == "Habit not scheduled for this date"

    unscheduled_unlog = client.post(
        f"/api/habits/{habit_id}/unlog",
        headers=headers,
        json={"date": not_monday.isoformat()},
    )
    assert unscheduled_unlog.status_code == 400
    assert unscheduled_unlog.get_json()["error"] == "Habit not scheduled for this date"


@pytest.mark.integration
def test_habit_endpoints_enforce_user_ownership(client, auth_headers):
    headers_a = auth_headers("a@example.com", "Password1")
    created = create_habit(client, headers_a, name="A Habit")
    habit_id = created.get_json()["habit"]["id"]

    headers_b = auth_headers("b@example.com", "Password1")
    update = client.put(
        f"/api/habits/{habit_id}",
        headers=headers_b,
        json={"name": "Should Fail", "frequency": "DAILY", "days_of_week": []},
    )
    delete = client.delete(f"/api/habits/{habit_id}", headers=headers_b)
    log = client.post(f"/api/habits/{habit_id}/log", headers=headers_b)

    assert update.status_code == 404
    assert delete.status_code == 404
    assert log.status_code == 404


@pytest.mark.integration
def test_list_habits_with_date_filter(client, auth_headers):
    headers = auth_headers()
    today = date.today()

    create_habit(
        client,
        headers,
        name="Starts Tomorrow",
        start_date=(today + timedelta(days=1)).isoformat(),
    )
    create_habit(client, headers, name="Visible Today")

    rv = client.get(f"/api/habits?date={today.isoformat()}", headers=headers)
    assert rv.status_code == 200
    names = [h["name"] for h in rv.get_json()]
    assert "Visible Today" in names
    assert "Starts Tomorrow" not in names


@pytest.mark.integration
def test_daily_summary_missed_and_complete_statuses(client, auth_headers):
    headers = auth_headers()
    target = date.today() - timedelta(days=1)

    one = create_habit(client, headers, name="Completed Habit", start_date=target.isoformat())
    two = create_habit(client, headers, name="Missed Habit", start_date=target.isoformat())
    habit_one_id = one.get_json()["habit"]["id"]
    habit_two_id = two.get_json()["habit"]["id"]

    client.post(
        f"/api/habits/{habit_one_id}/log",
        headers=headers,
        json={"date": target.isoformat()},
    )

    summary = client.get(f"/api/habits/daily-summary?date={target.isoformat()}", headers=headers)
    assert summary.status_code == 200
    by_id = {row["id"]: row for row in summary.get_json()}
    assert by_id[habit_one_id]["status"] == "complete"
    assert by_id[habit_two_id]["status"] == "missed"


@pytest.mark.integration
def test_log_summary_returns_dates_to_habit_ids(client, auth_headers):
    headers = auth_headers()
    target = date.today().replace(day=1)
    created = create_habit(client, headers, name="Summary Habit", start_date=target.isoformat())
    habit_id = created.get_json()["habit"]["id"]
    client.post(
        f"/api/habits/{habit_id}/log",
        headers=headers,
        json={"date": target.isoformat()},
    )

    month = target.strftime("%Y-%m")
    rv = client.get(f"/api/habits/log-summary?month={month}", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert target.isoformat() in data
    assert habit_id in data[target.isoformat()]


@pytest.mark.integration
def test_calendar_summary_contains_complete_partial_incomplete(client, auth_headers):
    if date.today().day < 3:
        pytest.skip("Need at least 3 days in current month to assert calendar states")

    headers = auth_headers()
    today = date.today()
    d1 = today - timedelta(days=2)
    d2 = today - timedelta(days=1)
    d3 = today

    h1 = create_habit(client, headers, name="H1", start_date=d1.isoformat()).get_json()["habit"][
        "id"
    ]
    h2 = create_habit(client, headers, name="H2", start_date=d1.isoformat()).get_json()["habit"][
        "id"
    ]

    client.post(f"/api/habits/{h1}/log", headers=headers, json={"date": d1.isoformat()})
    client.post(f"/api/habits/{h1}/log", headers=headers, json={"date": d2.isoformat()})
    client.post(f"/api/habits/{h2}/log", headers=headers, json={"date": d2.isoformat()})

    month = today.strftime("%Y-%m")
    rv = client.get(f"/api/habits/calendar-summary?month={month}", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert data[d1.isoformat()]["status"] == "partial"
    assert data[d2.isoformat()]["status"] == "complete"
    assert data[d3.isoformat()]["status"] in {"incomplete", "partial", "complete"}


@pytest.mark.integration
def test_calendar_summary_has_inactive_and_future_statuses(client, auth_headers):
    headers = auth_headers()
    today = date.today()
    create_habit(client, headers, name="Starts Today", start_date=today.isoformat())

    month = today.strftime("%Y-%m")
    rv = client.get(f"/api/habits/calendar-summary?month={month}", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()

    if today.day > 1:
        yesterday_iso = (today - timedelta(days=1)).isoformat()
        assert data[yesterday_iso]["status"] == "inactive"

    future_day = today + timedelta(days=1)
    if future_day.month == today.month:
        assert data[future_day.isoformat()]["status"] == "future"


@pytest.mark.integration
def test_create_habit_rejects_when_active_limit_reached(client, auth_headers, app):
    headers = auth_headers("limit-active@example.com", "Password1")

    with app.app_context():
        user = User.query.filter_by(email="limit-active@example.com").first()
        assert user is not None
        for i in range(100):
            db.session.add(
                Habit(
                    name=f"Active {i}",
                    user_id=user.id,
                    start_date=date.today(),
                    frequency="DAILY",
                    days_of_week=None,
                )
            )
        db.session.commit()

    rv = create_habit(client, headers, name="Should Fail")
    assert rv.status_code == 400
    assert rv.get_json()["error"] == "active_habit_limit_reached"


@pytest.mark.integration
def test_create_habit_rejects_when_total_limit_reached(client, auth_headers, app):
    headers = auth_headers("limit-total@example.com", "Password1")

    with app.app_context():
        user = User.query.filter_by(email="limit-total@example.com").first()
        assert user is not None
        for i in range(200):
            habit = Habit(
                name=f"Archived {i}",
                user_id=user.id,
                start_date=date.today(),
                frequency="DAILY",
                days_of_week=None,
            )
            db.session.add(habit)
            db.session.flush()
            db.session.add(HabitPause(habit_id=habit.id, start_date=date.today(), end_date=None))
        db.session.commit()

    rv = create_habit(client, headers, name="Should Fail Total")
    assert rv.status_code == 400
    assert rv.get_json()["error"] == "total_habit_limit_reached"


@pytest.mark.integration
def test_unarchive_rejects_when_active_limit_reached(client, auth_headers, app):
    headers = auth_headers("unarchive-limit@example.com", "Password1")
    archived = create_habit(client, headers, name="Archived target")
    target_id = archived.get_json()["habit"]["id"]
    client.post(f"/api/habits/{target_id}/archive", headers=headers)

    with app.app_context():
        user = User.query.filter_by(email="unarchive-limit@example.com").first()
        assert user is not None
        for i in range(100):
            db.session.add(
                Habit(
                    name=f"Active for unarchive {i}",
                    user_id=user.id,
                    start_date=date.today(),
                    frequency="DAILY",
                    days_of_week=None,
                )
            )
        db.session.commit()

    rv = client.post(f"/api/habits/{target_id}/unarchive", headers=headers)
    assert rv.status_code == 400
    assert rv.get_json()["error"] == "active_habit_limit_reached"


@pytest.mark.integration
def test_log_and_unlog_return_404_for_missing_habit(client, auth_headers):
    headers = auth_headers()
    missing_log = client.post("/api/habits/99999/log", headers=headers)
    missing_unlog = client.post("/api/habits/99999/unlog", headers=headers)
    assert missing_log.status_code == 404
    assert missing_unlog.status_code == 404
