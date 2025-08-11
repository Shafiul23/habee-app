# backend/app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
migrate = Migrate()
limiter = Limiter(key_func=get_remote_address, storage_uri=os.getenv("REDIS_URL", "memory://"))
