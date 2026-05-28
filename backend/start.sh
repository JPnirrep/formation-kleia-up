#!/bin/bash
set -e
if [ ! -f kleia_lms.db ]; then
    echo "Database not found — running seed script..."
    python seed.py
fi
echo "Starting FastAPI server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
