# AGENTS

This repository contains a Python backend and a React Native frontend.

## Workflow

- Backend tests:
  cd backend
  source venv/bin/activate
  pip install -r requirements.txt
  pip install -r requirements-dev.txt
  pytest -q

- Frontend tests:
  cd frontend
  npm ci
  npm test -- --watchAll=false

## Pull Requests

- Use concise commit messages summarizing changes.
- PR descriptions should include a summary of changes and the commands run in the testing section.
