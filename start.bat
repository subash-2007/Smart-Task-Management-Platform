@echo off
title TaskFlow Launcher
echo ===================================================
echo   TaskFlow - Smart Task Management Platform
echo   Auspify Technologies Internship Project
echo ===================================================
echo.

echo [1/2] Starting TaskFlow FastAPI Backend (:8002)...
start "TaskFlow Backend (:8002)" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8002"

echo [2/2] Starting TaskFlow Vite Frontend (:5175)...
start "TaskFlow Frontend (:5175)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   TaskFlow is launching!
echo   Frontend: http://localhost:5175
echo   Backend:  http://127.0.0.1:8002
echo   API Docs: http://127.0.0.1:8002/docs
echo   Demo Login: demo@taskflow.io / password123
echo ===================================================
echo.
pause
