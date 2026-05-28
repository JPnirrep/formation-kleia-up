@echo off
echo Lancement du projet Kleia-up...

echo [1/2] Lancement du Backend...
start "Backend" cmd /k "cd /d %~dp0\backend && .venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/2] Lancement du Frontend...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo Serveurs lances. Tu peux fermer cette fenetre.
pause