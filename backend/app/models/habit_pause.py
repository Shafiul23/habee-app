from app.extensions import db


class HabitPause(db.Model):
    __tablename__ = "habit_pauses"
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(
        db.Integer, db.ForeignKey("habit.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
