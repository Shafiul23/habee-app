from datetime import date, datetime, timedelta

import pytest
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.habit import Habit
from app.models.habit_pause import HabitPause
from app.models.log import HabitLog
from app.models.reset_token import PasswordResetToken
from app.models.user import User


@pytest.mark.integration
def test_habit_log_unique_constraint_enforced(app):
    with app.app_context():
        user = User(email="persist1@example.com")
        user.set_password("Password1")
        db.session.add(user)
        db.session.flush()

        habit = Habit(
            name="Hydrate",
            user_id=user.id,
            start_date=date.today(),
            frequency="DAILY",
            days_of_week=None,
        )
        db.session.add(habit)
        db.session.flush()

        db.session.add(HabitLog(habit_id=habit.id, date=date.today()))
        db.session.commit()

        db.session.add(HabitLog(habit_id=habit.id, date=date.today()))
        with pytest.raises(IntegrityError):
            db.session.commit()
        db.session.rollback()


@pytest.mark.integration
def test_delete_user_cascades_to_habits_logs_and_pauses(app):
    with app.app_context():
        user = User(email="cascade@example.com")
        user.set_password("Password1")
        db.session.add(user)
        db.session.flush()

        habit = Habit(
            name="Run",
            user_id=user.id,
            start_date=date.today(),
            frequency="DAILY",
            days_of_week=None,
        )
        db.session.add(habit)
        db.session.flush()

        db.session.add(HabitLog(habit_id=habit.id, date=date.today()))
        db.session.add(HabitPause(habit_id=habit.id, start_date=date.today(), end_date=None))
        db.session.commit()

        db.session.delete(user)
        db.session.commit()

        assert User.query.count() == 0
        assert Habit.query.count() == 0
        assert HabitLog.query.count() == 0
        assert HabitPause.query.count() == 0


@pytest.mark.integration
def test_password_reset_token_unique_constraint_enforced(app):
    with app.app_context():
        user = User(email="reset-uniq@example.com")
        user.set_password("Password1")
        db.session.add(user)
        db.session.flush()

        db.session.add(
            PasswordResetToken(
                user_id=user.id,
                token="same-token",
                expires_at=datetime.utcnow() + timedelta(hours=1),
            )
        )
        db.session.commit()

        db.session.add(
            PasswordResetToken(
                user_id=user.id,
                token="same-token",
                expires_at=datetime.utcnow() + timedelta(hours=2),
            )
        )
        with pytest.raises(IntegrityError):
            db.session.commit()
        db.session.rollback()


@pytest.mark.integration
def test_open_pause_changes_active_habit_count(app):
    with app.app_context():
        user = User(email="active-count@example.com")
        user.set_password("Password1")
        db.session.add(user)
        db.session.flush()

        active_habit = Habit(
            name="Active",
            user_id=user.id,
            start_date=date.today(),
            frequency="DAILY",
            days_of_week=None,
        )
        archived_habit = Habit(
            name="Archived",
            user_id=user.id,
            start_date=date.today(),
            frequency="DAILY",
            days_of_week=None,
        )
        resumed_habit = Habit(
            name="Resumed",
            user_id=user.id,
            start_date=date.today(),
            frequency="DAILY",
            days_of_week=None,
        )
        db.session.add_all([active_habit, archived_habit, resumed_habit])
        db.session.flush()

        db.session.add(HabitPause(habit_id=archived_habit.id, start_date=date.today(), end_date=None))
        db.session.add(
            HabitPause(
                habit_id=resumed_habit.id,
                start_date=date.today() - timedelta(days=2),
                end_date=date.today() - timedelta(days=1),
            )
        )
        db.session.commit()

        active_count = Habit.query.filter(
            Habit.user_id == user.id,
            ~Habit.pauses.any(HabitPause.end_date.is_(None)),
        ).count()
        assert active_count == 2
