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


@habits_bp.route("/calendar", methods=["GET"])
@jwt_required()
def calendar_summary():
    user_id = get_jwt_identity()
    month_str = request.args.get("month")

    if not month_str:
        return {"error": "Month query param is required. Format: YYYY-MM"}, 400

    try:
        start_date = datetime.strptime(month_str, "%Y-%m")
    except ValueError:
        return {"error": "Invalid month format. Use YYYY-MM"}, 400

    # Calculate end of month
    next_month = start_date.replace(day=28) + timedelta(days=4)
    end_date = next_month.replace(day=1)

    # Get user's habits
    habits = Habit.query.filter_by(user_id=user_id).all()
    habit_dict = {habit.id: habit.name for habit in habits}

    # Get logs for this user and this month
    logs = HabitLog.query.filter(
        HabitLog.habit_id.in_(habit_dict.keys()),
        HabitLog.date >= start_date.date(),
        HabitLog.date < end_date.date()
    ).all()

    # Group by date and return habit info
    calendar_data = defaultdict(list)
    for log in logs:
        calendar_data[log.date.isoformat()].append({
            "id": log.habit_id,
            "name": habit_dict[log.habit_id]
        })

    return jsonify(calendar_data)

