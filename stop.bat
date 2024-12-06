@echo off
echo Cleaning up development and production environments...

REM Stop all Docker containers
echo Stopping Docker containers...
docker-compose down

REM Kill any remaining node processes (for development)
echo Stopping React development server...
taskkill /F /IM node.exe /T 2>nul

REM Clean up Docker resources
echo Cleaning Docker resources...
docker system prune -f

echo All environments stopped and cleaned!