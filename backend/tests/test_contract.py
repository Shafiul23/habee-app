from datetime import date, timedelta

import pytest

from tests.helpers import create_habit


def assert_habit_shape(habit: dict):
    assert isinstance(habit["id"], int)
    assert isinstance(habit["name"], str)
    assert isinstance(habit["start_date"], str)
    assert habit["frequency"] in {"DAILY", "WEEKLY"}
    assert habit["days_of_week"] is None or isinstance(habit["days_of_week"], list)


@pytest.mark.integration
@pytest.mark.contract
def test_get_habits_response_contract(client, auth_headers):
    headers = auth_headers()
    create_habit(client, headers, name="Contract A")
    create_habit(client, headers, name="Contract B")

    rv = client.get("/api/habits/", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, list)
    assert len(data) >= 2

    for habit in data:
        assert_habit_shape(habit)
        assert isinstance(habit["pauses"], list)
        for pause in habit["pauses"]:
            assert isinstance(pause["start_date"], str)
            assert pause["end_date"] is None or isinstance(pause["end_date"], str)


@pytest.mark.integration
@pytest.mark.contract
def test_daily_summary_response_contract(client, auth_headers):
    headers = auth_headers()
    target = date.today() - timedelta(days=1)
    created = create_habit(
        client,
        headers,
        name="Daily Summary Contract",
        start_date=target.isoformat(),
    )
    habit_id = created.get_json()["habit"]["id"]
    client.post(
        f"/api/habits/{habit_id}/log",
        headers=headers,
        json={"date": target.isoformat()},
    )

    rv = client.get(f"/api/habits/daily-summary?date={target.isoformat()}", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, list)
    assert len(data) >= 1

    row = data[0]
    assert_habit_shape(row)
    assert row["status"] in {"complete", "missed", "unlogged"}
    assert isinstance(row["completed"], bool)


@pytest.mark.integration
@pytest.mark.contract
def test_archived_habits_response_contract(client, auth_headers):
    headers = auth_headers()
    created = create_habit(client, headers, name="Archive Contract")
    habit_id = created.get_json()["habit"]["id"]
    client.post(f"/api/habits/{habit_id}/archive", headers=headers)

    rv = client.get("/api/habits/archived", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, list)
    assert len(data) == 1

    row = data[0]
    assert_habit_shape(row)
    assert isinstance(row["pause_start_date"], str)


@pytest.mark.integration
@pytest.mark.contract
def test_calendar_summary_response_contract(client, auth_headers):
    headers = auth_headers()
    create_habit(client, headers, name="Calendar Contract")

    month = date.today().strftime("%Y-%m")
    rv = client.get(f"/api/habits/calendar-summary?month={month}", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, dict)

    # Validate at least one day entry shape.
    any_day = next(iter(data))
    assert isinstance(any_day, str)
    row = data[any_day]
    assert row["status"] in {"complete", "partial", "incomplete", "inactive", "future"}
    if "completed" in row:
        assert isinstance(row["completed"], int)
    if "total" in row:
        assert isinstance(row["total"], int)


@pytest.mark.integration
@pytest.mark.contract
def test_log_summary_response_contract(client, auth_headers):
    headers = auth_headers()
    created = create_habit(client, headers, name="Log Summary Contract")
    habit_id = created.get_json()["habit"]["id"]

    first = date.today().replace(day=1)
    client.post(f"/api/habits/{habit_id}/log", headers=headers, json={"date": first.isoformat()})
    month = first.strftime("%Y-%m")

    rv = client.get(f"/api/habits/log-summary?month={month}", headers=headers)
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, dict)
    for day, ids in data.items():
        assert isinstance(day, str)
        assert isinstance(ids, list)
        assert all(isinstance(i, int) for i in ids)
