@echo off
cd /d "%~dp0..\kaser-dokan-backend"
echo Starting Kacher Dokan Spring Boot backend + web on port 3000...
mvn spring-boot:run
pause
