@echo off
echo Starting SEMS Mock API Server...
echo Server will be available at http://localhost:3000
echo.
cd /d "%~dp0"
json-server --watch db.json --routes routes.json
pause
