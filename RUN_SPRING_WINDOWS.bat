@echo off
setlocal
cd /d "%~dp0kaser-dokan-backend"
where java >nul 2>nul || (echo Java 21 is required.& pause & exit /b 1)
where mvn >nul 2>nul || (echo Apache Maven is required. Install Maven or run from IntelliJ/VS Code Spring Boot support.& pause & exit /b 1)
echo.
echo ==========================================
echo  Kacher Dokan - Spring Boot Backend + Web
echo ==========================================
echo URL: http://localhost:3000
mvn spring-boot:run
pause
