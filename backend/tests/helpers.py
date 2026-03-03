from datetime import date


def create_habit(client, headers, **overrides):
    payload = {
        "name": "Contract Habit",
        "start_date": date.today().isoformat(),
        "frequency": "DAILY",
        "days_of_week": [],
    }
    payload.update(overrides)
    return client.post("/api/habits/", headers=headers, json=payload)
