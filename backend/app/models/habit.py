# backend/app/models/habit.py
from datetime import date
from app.extensions import db
from .habit_pause import HabitPause

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_date = db.Column(db.Date, default=date.today) 

    logs = db.relationship('HabitLog', backref='habit', lazy=True, cascade='all, delete-orphan')
    pauses = db.relationship('HabitPause', backref='habit', lazy=True, cascade='all, delete-orphan')
