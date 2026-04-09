@echo off
REM AI Resume Analyzer - Startup Script for Windows
REM This script helps set up and run the application

echo.
echo 🤖 AI Resume Analyzer - Startup Script
echo =======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Backend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo ❌ Frontend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo 📁 Project structure verified
echo.

REM Backend setup
echo 🔧 Setting up backend...
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    call npm install
) else (
    echo ✅ Backend dependencies already installed
)

REM Check if .env exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env and add your OPENAI_API_KEY
    echo    Get key from: https://platform.openai.com/api-keys
) else (
    echo ✅ .env file exists
)

cd ..

echo ✅ Backend setup complete
echo.

REM Frontend setup
echo 🎨 Setting up frontend...
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
) else (
    echo ✅ Frontend dependencies already installed
)

cd ..

echo ✅ Frontend setup complete
echo.

REM Final instructions
echo =========================================
echo 🎉 Setup Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Edit backend\.env and add OPENAI_API_KEY
echo.
echo 2. In Command Prompt 1, start the backend:
echo    cd backend
echo    npm run dev
echo.
echo 3. In Command Prompt 2, start the frontend:
echo    cd frontend
echo    npm start
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo For help, see QUICK_START.md or README.md
echo.
pause
