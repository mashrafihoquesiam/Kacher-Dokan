#!/bin/bash
cd "$(dirname "$0")"
echo "Kacher Dokan - Expo Mobile"
if [ ! -f .env ]; then
  echo ".env is missing. Copy .env.example to .env and set EXPO_PUBLIC_API_URL to this Mac/PC LAN IP."
  exit 1
fi
command -v node >/dev/null 2>&1 || { echo "Node.js is not installed."; exit 1; }
npm install || exit 1
npx expo start --lan --clear
