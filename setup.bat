@echo off
echo === Backend install ===
cd /d "%~dp0server"
call npm install
call npm run seed
echo === Frontend install ===
cd /d "%~dp0client"
call npm install
echo.
echo Setup complete! Ab run-server.bat aur run-client.bat chalayein.
pause
