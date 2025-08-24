@echo off

:: Simple Node.js Path Setup Script
:: Please manually set the correct Node.js installation path
set "NODE_PATH=C:\Program Files\nodejs"

:: Check if Node.js exists
if exist "%NODE_PATH%\node.exe" (
    echo Found Node.js at: %NODE_PATH%
    set "PATH=%NODE_PATH%;%PATH%"

    :: Display versions
    node -v
    npm -v

    :: Install dependencies
    echo Installing dependencies...
    npm install

    :: Start development server without ESLint
    echo Starting development server without ESLint...
    npm run serve-no-lint
) else (
    echo Node.js not found at: %NODE_PATH%
    echo Please edit this batch file and set NODE_PATH to your Node.js installation directory
    echo Example: set "NODE_PATH=C:\Program Files\nodejs"
    pause
)