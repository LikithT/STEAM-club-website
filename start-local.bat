@echo off
echo 🚀 Starting Heritage H2GP STEAM Website locally...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python found - Starting local server...
    echo 🌐 Website will be available at: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo ----------------------------------------
    python -m http.server 8000
) else (
    echo ❌ Python not found. Please try one of these alternatives:
    echo.
    echo Option 1: Install Python
    echo   Download from: https://www.python.org/downloads/
    echo.
    echo Option 2: Use Node.js ^(if installed^)
    echo   npx http-server -p 8000
    echo.
    echo Option 3: Open index.html directly in your browser
    echo   Double-click on index.html
    echo.
    pause
)
