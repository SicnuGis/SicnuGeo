@echo off

:: Simple Node.js Project Startup Script

:: Check if Node.js is installed
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed.
    echo Please install Node.js first from https://nodejs.org/
    pause
    exit /b 1
)

:: Display Node.js and npm versions
echo Node.js version:
node -v
echo npm version:
npm -v

:: Install dependencies
echo Installing dependencies...
npm install

:: Start Vite development server
echo Starting Vite development server...
npm run dev