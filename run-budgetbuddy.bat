@echo off
echo ===================================================
echo       BUDGET BUDDY - ONE-COMMAND LAUNCHER
echo ===================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detected, continuing...

REM Set up environment
echo Setting up environment...
cd /d "%~dp0"

REM Kill any existing processes on the required ports
echo Checking for processes using required ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do (
    echo Stopping process on port 5000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo Stopping process on port 3000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>nul
)

REM Start backend server
echo.
echo [1/2] Starting Backend Server...
start "BudgetBuddy Backend" cmd /k "npm run dev"
echo Backend starting at http://localhost:5000

REM Wait a moment for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend with Windows-compatible method
echo.
echo [2/2] Starting Frontend...
cd frontend
start "BudgetBuddy Frontend" cmd /k "npm run start:windows"

REM Final message
echo.
echo ===================================================
echo Budget Buddy is starting up!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo If the dashboard shows "Failed to load data":
echo 1. Open your browser console (F12)
echo 2. Copy the contents of frontend/fix-dashboard.js
echo 3. Paste into console and run: fixDashboard()
echo ===================================================
echo.

REM Open browser automatically after a short delay
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to exit this window (the app will continue running)
pause >nul 