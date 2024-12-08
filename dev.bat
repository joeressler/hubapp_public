@echo off
REM Stop any running containers
echo Stopping containers...
docker-compose down

REM Start the Flask backend
echo Starting Flask backend...
start cmd /k "docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build"

REM Start the React development server
echo Starting React development server...
cd frontend
start cmd /k "npm start"

echo Development environment started!
echo Flask API running on http://localhost:8080
echo React dev server running on http://localhost:3000