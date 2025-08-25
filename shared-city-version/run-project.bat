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

:: Check if serve-no-lint script exists in package.json
echo Checking for serve-no-lint script...
if exist package.json (
    findstr /C:"serve-no-lint" package.json >nul
    if %ERRORLEVEL% EQU 0 (
        echo Starting development server without ESLint...
        npm run serve-no-lint
    ) else (
        echo serve-no-lint script not found in package.json
        echo Trying to start with npm run serve...
        npm run serve
    )
) else (
    echo package.json not found
    pause
    exit /b 1
)