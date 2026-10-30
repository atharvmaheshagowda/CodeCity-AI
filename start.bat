@echo off
setlocal enabledelayedexpansion

title CodeCity AI - Launcher

echo ===================================================
echo             Starting CodeCity AI
echo ===================================================
echo.

:: Move to the project root directory where the batch file is located
cd /d "%~dp0"

:: Detect Python executable (.venv preferred)
set "PYTHON_EXE="
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
    echo [OK] Using virtual environment Python: !PYTHON_EXE!
) else (
    where python >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_EXE=python"
        echo [WARN] .venv not found. Falling back to system Python.
    ) else (
        echo [ERROR] Python not found in .venv or PATH.
        echo Please run setup first or install Python.
        pause
        exit /b 1
    )
)

:: Detect npm command
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] npm was not found in PATH.
    echo Please install Node.js / npm to run the frontend.
    pause
    exit /b 1
)

echo.
echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "CodeCity AI - Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && "!PYTHON_EXE!" -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo Starting Frontend (Vite on http://127.0.0.1:5173)...
start "CodeCity AI - Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ===================================================
echo Both services have been launched in separate windows!
echo   - Backend:  http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)
echo   - Frontend: http://127.0.0.1:5173
echo ===================================================
echo.
echo Press any key to close this launcher window (services will stay running).
pause >nul
