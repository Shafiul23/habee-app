from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app.models.reset_token import PasswordResetToken
import os
import json
import re
import requests
import uuid
import jwt

auth_bp = Blueprint("auth", __name__)
APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    email_regex = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email address"}), 400
    
    password_regex = r"^(?=.*[A-Z])(?=.*\d).{6,}$"
    if not re.match(password_regex, password):
        return jsonify({
            "error": "Password must be at least 6 characters, include 1 capital and 1 number"
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    new_user = User(email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/apple", methods=["POST"])
def apple_login():
    data = request.get_json()
    identity_token = data.get("token")

    if not identity_token:
        return jsonify({"error": "Token is required"}), 400

    try:
        apple_keys = requests.get("https://appleid.apple.com/auth/keys").json()
        header = jwt.get_unverified_header(identity_token)
        key = next((k for k in apple_keys["keys"] if k["kid"] == header["kid"]), None)
        if key is None:
            raise Exception("Key not found")

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
        decoded = jwt.decode(
            identity_token,
            public_key,
            algorithms=["RS256"],
            audience=APPLE_CLIENT_ID,
        )
        apple_id = decoded.get("sub")
        email = decoded.get("email")
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    user = None
    if apple_id:
        user = User.query.filter_by(apple_id=apple_id).first()

    if not user and email:
        user = User.query.filter_by(email=email).first()
        if user:
            user.apple_id = apple_id

    if not user:
        if not email:
            return jsonify({"error": "Email not provided; user not found"}), 400
        user = User(email=email, apple_id=apple_id)
        user.set_password(str(uuid.uuid4()))
        db.session.add(user)

    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/delete", methods=["DELETE"])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200


# Store tokens in DB
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "If this email exists, a reset link will be sent."}), 200

    token = str(uuid.uuid4())
    expiry = datetime.utcnow() + timedelta(hours=1)

    reset_entry = PasswordResetToken(user_id=user.id, token=token, expires_at=expiry)
    db.session.add(reset_entry)
    db.session.commit()

    # TODO: Replace this with actual email logic
    # Deep link to open the mobile app directly for password reset
    print(f"User email: {email}")
    print(f"Password reset link: habee://reset-password/{token}")

    return jsonify({"message": "Reset link sent to email"}), 200


@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    data = request.get_json()
    new_password = data.get("password")

    if not new_password:
        return jsonify({"error": "Password is required"}), 400

    reset_entry = PasswordResetToken.query.filter_by(token=token).first()
    if not reset_entry or reset_entry.expires_at < datetime.utcnow():
        return jsonify({"error": "Invalid or expired token"}), 400

    user = User.query.get(reset_entry.user_id)
    user.set_password(new_password)
    db.session.delete(reset_entry)
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200


@auth_bp.route("/validate-reset-token/<token>", methods=["GET"])
def validate_reset_token(token):
    entry = PasswordResetToken.query.filter_by(token=token).first()

    if not entry or entry.expires_at < datetime.utcnow():
        return jsonify({"error": "Invalid or expired token"}), 400

    return jsonify({"message": "Valid token"}), 200

