# app/routes/habits.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from app.extensions import db, limiter
from app.models.habit import Habit
from app.models.log import HabitLog
from app.models.habit_pause import HabitPause
from datetime import date, datetime, timedelta
from collections import defaultdict
from calendar import monthrange


def is_applicable(habit: Habit, check_date: date) -> bool:
    """Return True if the habit should be shown on the given date."""
    if habit.start_date > check_date:
        return False
    for p in habit.pauses:
        if p.start_date <= check_date and (p.end_date is None or p.end_date >= check_date):
            return False
    if habit.frequency == 'DAILY':
        return True
    if habit.frequency == 'WEEKLY':
        weekday = check_date.weekday()  # 0=Mon..6=Sun
        return habit.days_of_week and weekday in habit.days_of_week
    return True


habits_bp = Blueprint("habits", __name__)


@habits_bp.route("/test", methods=["GET"])
def test():
    return {"message": "Habits route works!"}


@habits_bp.route("/", methods=["POST"])
@jwt_required()
def create_habit():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get("name")
    start_date_str = data.get("start_date")
    frequency = data.get("frequency", "DAILY")
    days = data.get("days_of_week")

    if not name:
        return jsonify({"error": "Habit name is required"}), 400

    name = name.strip()

    if len(name) > 64:
        return jsonify({"error": "Habit name cannot exceed 64 characters"}), 400

    existing = Habit.query.filter(
        db.func.lower(Habit.name) == name.lower(),
        Habit.user_id == user_id
    ).first()

    if existing:
        paused = HabitPause.query.filter_by(
            habit_id=existing.id, end_date=None
        ).first()
        if paused:
            return (
                jsonify(
                    {"error": "duplicate_name_archived", "archivedHabitId": existing.id}
                ),
                409,
            )
        return jsonify({"error": "duplicate_name_active"}), 409

    try:
        start_date = date.fromisoformat(start_date_str) if start_date_str else date.today()
    except ValueError:
        return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400

    if frequency not in ["DAILY", "WEEKLY"]:
        return jsonify({"error": "Invalid frequency"}), 400
    if frequency == "WEEKLY":
        if not isinstance(days, list) or len(days) == 0:
            return jsonify({"error": "days_of_week must be a non-empty list"}), 400
        try:
            days = [int(d) for d in days]
        except Exception:
            return jsonify({"error": "days_of_week must be integers"}), 400
        if any(d < 0 or d > 6 for d in days):
            return jsonify({"error": "days_of_week must be between 0 and 6"}), 400
    else:
        days = None

    active_count = Habit.query.filter(
        Habit.user_id == user_id,
        ~Habit.pauses.any(HabitPause.end_date.is_(None))
    ).count()
    total_count = Habit.query.filter_by(user_id=user_id).count()
    if active_count >= 100:
        return jsonify({"error": "active_habit_limit_reached"}), 400
    if total_count >= 200:
        return jsonify({"error": "total_habit_limit_reached"}), 400

    habit = Habit(
        name=name,
        user_id=user_id,
        start_date=start_date,
        frequency=frequency,
        days_of_week=days,
    )
    db.session.add(habit)
    db.session.commit()

    return jsonify({
        "message": "Habit created",
        "habit": {
            "id": habit.id,
            "name": habit.name,
            "start_date": habit.start_date.isoformat(),
            "frequency": habit.frequency,
            "days_of_week": habit.days_of_week,
        }
    })


@habits_bp.route("/<int:habit_id>", methods=["PUT"])
@jwt_required()
def update_habit(habit_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    new_name = data.get("name")
    if not new_name:
        return jsonify({"error": "Habit name is required"}), 400

    new_name = new_name.strip()

    if len(new_name) > 64:
        return jsonify({"error": "Habit name cannot exceed 64 characters"}), 400

    existing = Habit.query.filter(
        db.func.lower(Habit.name) == new_name.lower(),
        Habit.user_id == user_id,
        Habit.id != habit_id
    ).first()

    if existing:
        paused = HabitPause.query.filter_by(habit_id=existing.id, end_date=None).first()
        if paused:
            return (
                jsonify({"error": "duplicate_name_archived", "archivedHabitId": existing.id}),
                409,
            )
        return jsonify({"error": "duplicate_name_active"}), 409

    frequency = data.get("frequency", habit.frequency)
    days = data.get("days_of_week", habit.days_of_week)
    if frequency not in ["DAILY", "WEEKLY"]:
        return jsonify({"error": "Invalid frequency"}), 400
    if frequency == "WEEKLY":
        if not isinstance(days, list) or len(days) == 0:
            return jsonify({"error": "days_of_week must be a non-empty list"}), 400
        try:
            days = [int(d) for d in days]
        except Exception:
            return jsonify({"error": "days_of_week must be integers"}), 400
        if any(d < 0 or d > 6 for d in days):
            return jsonify({"error": "days_of_week must be between 0 and 6"}), 400
    else:
        days = None

    habit.name = new_name
    habit.frequency = frequency
    habit.days_of_week = days
    db.session.commit()

    return jsonify({
        "message": "Habit updated successfully",
        "habit": {
            "id": habit.id,
            "name": habit.name,
            "start_date": habit.start_date.isoformat(),
            "frequency": habit.frequency,
            "days_of_week": habit.days_of_week,
        }
    })


@habits_bp.route("/<int:habit_id>", methods=["DELETE"])
@jwt_required()
def delete_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    db.session.delete(habit)
    db.session.commit()

    return jsonify({"message": "Habit deleted successfully"})


@habits_bp.route("/<int:habit_id>/archive", methods=["POST"])
@jwt_required()
def archive_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return {"error": "Habit not found"}, 404

    open_pause = HabitPause.query.filter_by(habit_id=habit_id, end_date=None).first()
    if not open_pause:
        pause = HabitPause(habit_id=habit_id, start_date=date.today())
        db.session.add(pause)
        db.session.commit()

    return jsonify({"habit": {"id": habit.id, "name": habit.name}})


@habits_bp.route("/<int:habit_id>/unarchive", methods=["POST"])
@jwt_required()
def unarchive_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return {"error": "Habit not found"}, 404
    active_count = Habit.query.filter(
        Habit.user_id == user_id,
        ~Habit.pauses.any(HabitPause.end_date.is_(None))
    ).count()
    if active_count >= 100:
        return jsonify({"error": "active_habit_limit_reached"}), 400

    open_pause = HabitPause.query.filter_by(habit_id=habit_id, end_date=None).first()
    if open_pause:
        open_pause.end_date = date.today() - timedelta(days=1)
        db.session.commit()

    return jsonify({"habit": {"id": habit.id, "name": habit.name}})


@habits_bp.route("/archived", methods=["GET"])
@jwt_required()
def archived_habits():
    user_id = get_jwt_identity()
    habits = (
        Habit.query.filter(Habit.user_id == user_id)
        .join(HabitPause)
        .filter(HabitPause.end_date.is_(None))
        .all()
    )

    result = []
    for h in habits:
        pause = next((p for p in h.pauses if p.end_date is None), None)
        result.append(
            {
                "id": h.id,
                "name": h.name,
                "start_date": h.start_date.isoformat(),
                "frequency": h.frequency,
                "days_of_week": h.days_of_week,
                "pause_start_date": pause.start_date.isoformat() if pause else None,
            }
        )

    return jsonify(result)


@habits_bp.route("/", methods=["GET"])
@jwt_required()
def list_habits():
    user_id = get_jwt_identity()
    date_str = request.args.get("date")
    habits = Habit.query.filter_by(user_id=user_id).all()

    if date_str:
        try:
            selected_date = date.fromisoformat(date_str)
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD"}, 400
        habits = [h for h in habits if is_applicable(h, selected_date)]

    return jsonify([
        {
            "id": h.id,
            "name": h.name,
            "start_date": h.start_date.isoformat(),
            "frequency": h.frequency,
            "days_of_week": h.days_of_week,
            "pauses": [
                {
                    "start_date": p.start_date.isoformat(),
                    "end_date": p.end_date.isoformat() if p.end_date else None,
                }
                for p in h.pauses
            ],
        }
        for h in habits
    ])


@habits_bp.route("/<int:habit_id>/log", methods=["POST"])
@jwt_required()
@limiter.limit("10/minute")
def log_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    data = request.get_json(silent=True) or {}
    date_str = data.get("date")
    try:
        log_date = date.fromisoformat(date_str) if date_str else date.today()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if not is_applicable(habit, log_date):
        return jsonify({"error": "Habit not scheduled for this date"}), 400

    existing_log = HabitLog.query.filter_by(habit_id=habit_id, date=log_date).first()

    if existing_log:
        return jsonify({"message": "Habit already logged for this date"}), 200

    log = HabitLog(habit_id=habit.id, date=log_date)
    try:
        db.session.add(log)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Habit already logged for this date"}), 200

    return jsonify({"message": "Habit logged"})


@habits_bp.route("/<int:habit_id>/unlog", methods=["POST"])
@jwt_required()
@limiter.limit("10/minute")
def unlog_habit(habit_id):
    user_id = get_jwt_identity()

    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    data = request.get_json(silent=True) or {}
    date_str = data.get("date")
    try:
        log_date = date.fromisoformat(date_str) if date_str else date.today()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if not is_applicable(habit, log_date):
        return jsonify({"error": "Habit not scheduled for this date"}), 400

    log = HabitLog.query.filter_by(habit_id=habit.id, date=log_date).first()

    if not log:
        return jsonify({"message": "No log found for this date"}), 404

    db.session.delete(log)
    db.session.commit()

    return jsonify({"message": "Habit log undone"})


@habits_bp.route("/log-summary", methods=["GET"])
@jwt_required()
def log_summary():
    user_id = get_jwt_identity()
    month_str = request.args.get("month")

    if not month_str:
        return {"error": "Month query param required. Format: YYYY-MM"}, 400

    try:
        year, month = map(int, month_str.split("-"))
    except ValueError:
        return {"error": "Invalid month format. Use YYYY-MM"}, 400

    start_date = date(year, month, 1)
    end_date = date(year, month, monthrange(year, month)[1])

    habits = Habit.query.filter_by(user_id=user_id).all()
    habit_ids = [h.id for h in habits]

    logs = HabitLog.query.filter(
        HabitLog.habit_id.in_(habit_ids),
        HabitLog.date >= start_date,
        HabitLog.date <= end_date
    ).all()

    result = {}
    for log in logs:
        day = log.date.isoformat()
        if day not in result:
            result[day] = []
        result[day].append(log.habit_id)

    return jsonify(result)


@habits_bp.route("/daily-summary", methods=["GET"])
@jwt_required()
def daily_summary():
    user_id = get_jwt_identity()
    date_str = request.args.get("date")

    if not date_str:
        return {"error": "Date query param is required. Format: YYYY-MM-DD"}, 400

    try:
        selected_date = date.fromisoformat(date_str)
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}, 400

    habits = Habit.query.filter(Habit.user_id == user_id).all()
    applicable = [h for h in habits if is_applicable(h, selected_date)]

    habit_ids = [h.id for h in applicable]

    # Get logs for this date
    logs = HabitLog.query.filter(
        HabitLog.habit_id.in_(habit_ids),
        HabitLog.date == selected_date
    ).all()

    logged_ids = {log.habit_id for log in logs}

    # Return habit list with completed status
    summary = []
    today = date.today()
    for habit in applicable:
        if habit.id in logged_ids:
            status = "complete"
        else:
            status = "missed" if selected_date < today else "unlogged"
        summary.append({
            "id": habit.id,
            "name": habit.name,
            "start_date": habit.start_date.isoformat(),
            "frequency": habit.frequency,
            "days_of_week": habit.days_of_week,
            "status": status,
            "completed": habit.id in logged_ids,
        })

    return jsonify(summary)


@habits_bp.route("/calendar-summary", methods=["GET"])
@jwt_required()
def calendar_summary():
    user_id = get_jwt_identity()
    month_str = request.args.get("month")

    if not month_str:
        return {"error": "Month query param is required. Format: YYYY-MM"}, 400

    try:
        month_start = datetime.strptime(month_str, "%Y-%m").date()
    except ValueError:
        return {"error": "Invalid month format. Use YYYY-MM"}, 400

    # Generate all days in the month
    from calendar import monthrange
    _, last_day = monthrange(month_start.year, month_start.month)
    month_days = [month_start.replace(day=day) for day in range(1, last_day + 1)]

    # Get user's habits
    habits = Habit.query.filter_by(user_id=user_id).all()
    if not habits:
        return jsonify({})  # No habits for user

    habit_dict = {h.id: h for h in habits}
    habit_ids = list(habit_dict.keys())

    # Get logs for habits during this month
    month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
    logs = HabitLog.query.filter(
        HabitLog.habit_id.in_(habit_ids),
        HabitLog.date >= month_start,
        HabitLog.date < month_end
    ).all()

    # Organize logs by date
    logs_by_date = defaultdict(list)
    for log in logs:
        logs_by_date[log.date].append(log.habit_id)

    today = date.today()
    summary = {}

    for day in month_days:
        if day > today:
            summary[day.isoformat()] = {"status": "future"}
            continue

        # Only consider habits that should appear on this day
        applicable_habits = [h for h in habits if is_applicable(h, day)]
        total = len(applicable_habits)

        if total == 0:
            summary[day.isoformat()] = {"status": "inactive"}
            continue

        completed = logs_by_date.get(day, [])
        applicable_ids = {h.id for h in applicable_habits}
        done = len({hid for hid in completed if hid in applicable_ids})

        if done == 0:
            status = "incomplete"
        elif done == total:
            status = "complete"
        else:
            status = "partial"

        summary[day.isoformat()] = {
            "status": status,
            "completed": done,
            "total": total
        }

    return jsonify(summary)
