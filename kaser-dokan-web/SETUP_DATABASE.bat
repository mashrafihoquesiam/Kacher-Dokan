@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Kacher Dokan - Database Setup

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SETUP_DATABASE.ps1"
if errorlevel 1 (
  echo.
  echo Database setup was not completed.
  pause
  exit /b 1
)

if not exist "node_modules\mongodb\package.json" (
  echo Installing required packages for the database test...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo.
node db-check.js
echo.
pause
