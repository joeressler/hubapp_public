@echo off
REM Production deployment script

REM Stop any running environments
echo Stopping any running environments...
call stop.bat

REM Build and start production containers
echo Building and starting production environment...
docker-compose up --build