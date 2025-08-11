# backend/app/models/log.py
from app.extensions import db
from datetime import date


class HabitLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, default=date.today, nullable=False)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit.id'), nullable=False)
    __table_args__ = (db.UniqueConstraint('habit_id', 'date', name='uix_habit_date'),)
