@echo off
echo ========================================
echo SmartStay Server Restart Script
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo Node.js processes stopped successfully
) else (
    echo No Node.js processes were running
)
echo.

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo.

echo Starting backend server...
cd backend
start "SmartStay Backend" cmd /k "npm start"
echo Backend server starting...
echo.

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul
echo.

echo Starting frontend server...
cd ..\frontend
start "SmartStay Frontend" cmd /k "npm start"
echo Frontend server starting...
echo.

echo ========================================
echo Servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:5000/api-docs
echo.
echo Check the new terminal windows for server status.
echo Press any key to close this window...
pause >nul
