# backend/app/__init__.py
from flask import Flask
from .config import Config
from .extensions import db, jwt, cors, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, db)

    from .routes.auth import auth_bp
    from .routes.habits import habits_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(habits_bp, url_prefix="/api/habits")

    from app.models import user, habit, log

    return app
