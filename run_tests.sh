#!/bin/bash
set -e
cd backend
PYTHONPATH=. pytest "$@"
cd ../frontend
npm test
