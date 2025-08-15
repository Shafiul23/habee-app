from datetime import date


def auth_token(client):
    client.post("/api/auth/register", json={"email": "user@example.com", "password": "Password1"})
    rv = client.post("/api/auth/login", json={"email": "user@example.com", "password": "Password1"})
    return rv.get_json()["access_token"]


def test_create_habit_and_log(client):
    token = auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    rv = client.post(
        "/api/habits/",
        headers=headers,
        json={"name": "Drink Water"},
    )
    assert rv.status_code == 200
    habit_id = rv.get_json()["habit"]["id"]

    rv = client.post(f"/api/habits/{habit_id}/log", headers=headers)
    assert rv.status_code == 200

    today = date.today().isoformat()
    rv = client.get(f"/api/habits/daily-summary?date={today}", headers=headers)
    assert rv.status_code == 200
    summary = rv.get_json()
    assert len(summary) == 1
    assert summary[0]["id"] == habit_id
    assert summary[0]["completed"] is True
