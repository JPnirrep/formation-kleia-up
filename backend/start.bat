@echo off
REM Start script for Kleia-up Backend (Windows / SQLite local dev)

if not exist kleia_lms.db (
    echo Database not found — running seed script...
    .venv\Scripts\python seed.py
    if %errorlevel% neq 0 (
        echo Seed script failed!
        exit /b %errorlevel%
    )
    echo Database seeded successfully.
)

echo Starting FastAPI server...
.venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
