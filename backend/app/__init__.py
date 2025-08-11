# backend/app/__init__.py
from flask import Flask, jsonify
from .config import Config
from .extensions import db, jwt, cors, migrate, limiter
from sqlalchemy.exc import OperationalError


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    # Init extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.habits import habits_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(habits_bp, url_prefix="/api/habits")

    # Import models so Alembic/migrate sees them
    from app.models import user, habit, log, reset_token  # noqa: F401

    @app.errorhandler(OperationalError)
    def handle_operational_error(e):
        db.session.rollback()
        return jsonify({"error": "database_unavailable"}), 503

    return app
