#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running backend tests..."
cd "$ROOT_DIR/backend"
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
pytest -q

echo "Running frontend unit and integration tests..."
cd "$ROOT_DIR/frontend"
npm ci
npm run test:unit
npm run test:integration

echo "All test suites completed."
