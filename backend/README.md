# 🐝 Habee Backend – Flask API

This is the backend for **Habee**, a mobile habit-tracking app built with purpose and polish. The API is powered by **Flask**, with **JWT authentication**, **PostgreSQL** persistence, and support for scalable, real-time habit tracking features.

---

## 🛠️ Tech Stack

- **Flask** with application factory pattern
- **SQLAlchemy** ORM + PostgreSQL
- **Flask-JWT-Extended** for authentication
- **Flask-Migrate** for database migrations
- **Flask-CORS** for frontend-backend integration
- **python-dotenv** for environment config

---

## ⚙️ Setup Instructions

### 1. Clone and `cd` into the project

```bash
git clone https://github.com/shafiul23/habee-app.git
cd habee-app/backend
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create a `.env` file

```env
FLASK_APP=app
FLASK_ENV=development
FLASK_RUN_HOST=0.0.0.0
FLASK_RUN_PORT=5050

JWT_SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://your_user@localhost/your_db
APPLE_CLIENT_ID=your-apple-service-id
```

Replace `your_user` and `your_db` with your actual PostgreSQL credentials.

### 5. Initialize the database

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 6. Run the server

```bash
flask run
```

The server will be available at:

```
http://localhost:5050
```

Or on your local network at:

```
http://<your-local-ip>:5050
```

---

## 📁 Folder Structure

```
app/
├── __init__.py       # Application factory
├── models.py         # SQLAlchemy models
├── routes/           # Auth and habit routes
├── extensions.py     # DB, JWT, CORS, Migrate
├── utils/            # Helper functions
migrations/           # Flask-Migrate tracking
```

---

## 🔐 Auth Overview

- Register & login routes return JWTs
- Tokens stored in SecureStore on frontend
- Authenticated routes require `Authorization: Bearer <token>`

---

## 🐞 Troubleshooting

- If you renamed the project folder, recreate your virtualenv (`venv`) to avoid path issues.
- Make sure PostgreSQL is running locally or adjust `DATABASE_URL` to point to your remote DB.
