# app/routes/habits.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.habit import Habit
from app.models.log import HabitLog
from datetime import date, datetime, timedelta
from collections import defaultdict



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

    if not name:
        return jsonify({"error": "Habit name is required"}), 400

    try:
        start_date = date.fromisoformat(start_date_str) if start_date_str else date.today()
    except ValueError:
        return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400

    habit = Habit(name=name, user_id=user_id, start_date=start_date)
    db.session.add(habit)
    db.session.commit()

    return jsonify({
        "message": "Habit created",
        "habit": {
            "id": habit.id,
            "name": habit.name,
            "start_date": habit.start_date.isoformat()
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


@habits_bp.route("/", methods=["GET"])
@jwt_required()
def list_habits():
    user_id = get_jwt_identity()
    habits = Habit.query.filter_by(user_id=user_id).all()

    return jsonify([
        {"id": h.id, "name": h.name, "start_date": h.start_date.isoformat()} for h in habits
    ])



@habits_bp.route("/<int:habit_id>/log", methods=["POST"])
@jwt_required()
def log_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    today = date.today()
    existing_log = HabitLog.query.filter_by(habit_id=habit_id, date=today).first()

    if existing_log:
        return jsonify({"message": "Habit already logged for today"}), 200

    log = HabitLog(habit_id=habit.id)
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Habit logged for today"})


@habits_bp.route("/<int:habit_id>/unlog", methods=["POST"])
@jwt_required()
def unlog_habit(habit_id):
    user_id = get_jwt_identity()

    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    today = date.today()
    log = HabitLog.query.filter_by(habit_id=habit.id, date=today).first()

    if not log:
        return jsonify({"message": "No log found for today"}), 404

    db.session.delete(log)
    db.session.commit()

    return jsonify({"message": "Habit log undone for today"})



@habits_bp.route("/<int:habit_id>/logs", methods=["GET"])
@jwt_required()
def get_habit_logs(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    logs = HabitLog.query.filter_by(habit_id=habit.id).all()
    return jsonify([
        {"date": log.date.isoformat()} for log in logs
    ])


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

    # Get all user's habits active on this date
    habits = Habit.query.filter(
        Habit.user_id == user_id,
        Habit.start_date <= selected_date
    ).all()

    habit_ids = [h.id for h in habits]

    # Get logs for this date
    logs = HabitLog.query.filter(
        HabitLog.habit_id.in_(habit_ids),
        HabitLog.date == selected_date
    ).all()

    logged_ids = {log.habit_id for log in logs}

    # Return habit list with completed status
    summary = []
    for habit in habits:
        summary.append({
            "id": habit.id,
            "name": habit.name,
            "start_date": habit.start_date.isoformat(),
            "completed": habit.id in logged_ids
        })

    return jsonify(summary)


# @habits_bp.route("/calendar-summary", methods=["GET"])
# @jwt_required()
# def calendar_summary():
#     user_id = get_jwt_identity()
#     month_str = request.args.get("month")

#     if not month_str:
#         return {"error": "Month query param is required. Format: YYYY-MM"}, 400

#     try:
#         month_start = datetime.strptime(month_str, "%Y-%m").date()
#     except ValueError:
#         return {"error": "Invalid month format. Use YYYY-MM"}, 400

#     # Generate all days in the month
#     from calendar import monthrange
#     _, last_day = monthrange(month_start.year, month_start.month)
#     month_days = [month_start.replace(day=day) for day in range(1, last_day + 1)]

#     # Get user's habits
#     habits = Habit.query.filter_by(user_id=user_id).all()
#     if not habits:
#         return jsonify({})  # No habits for user

#     habit_dict = {h.id: h for h in habits}
#     habit_ids = list(habit_dict.keys())

#     # Get logs for habits during this month
#     month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
#     logs = HabitLog.query.filter(
#         HabitLog.habit_id.in_(habit_ids),
#         HabitLog.date >= month_start,
#         HabitLog.date < month_end
#     ).all()

#     # Organize logs by date
#     logs_by_date = defaultdict(list)
#     for log in logs:
#         logs_by_date[log.date].append(log.habit_id)

#     today = date.today()
#     summary = {}

#     for day in month_days:
#         if day > today:
#             summary[day.isoformat()] = { "status": "future" }
#             continue

#         # Get habits active on that day
#         active_habits = [h for h in habits if h.start_date <= day]
#         total = len(active_habits)

#         if total == 0:
#             summary[day.isoformat()] = { "status": "inactive" }
#             continue

#         completed = logs_by_date.get(day, [])
#         done = len(set(completed))

#         if done == 0:
#             status = "incomplete"
#         elif done == total:
#             status = "complete"
#         else:
#             status = "partial"

#         summary[day.isoformat()] = {
#             "status": status,
#             "completed": done,
#             "total": total
#         }

#     return jsonify(summary)


