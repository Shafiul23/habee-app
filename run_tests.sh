#!/bin/bash
set -e
cd backend
PYTHONPATH=. pytest "$@"
