@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo   Kacher Dokan - Expo Mobile
 echo ================================================
if not exist .env (
  echo [INFO] .env is missing.
  echo Copy .env.example to .env and put your PC IPv4 in EXPO_PUBLIC_API_URL.
  echo Example: EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
  pause
  exit /b 1
)
where node >nul 2>&1 || (echo Node.js is not installed.& pause & exit /b 1)
call npm install
if errorlevel 1 (echo npm install failed.& pause & exit /b 1)
call npx expo start --lan --clear
