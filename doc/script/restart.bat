@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

call "%SCRIPT_DIR%shutdown.bat"
timeout /t 1 /nobreak >nul
call "%SCRIPT_DIR%startup.bat"
