@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "JAR_NAME=dataRoomServer.jar"
set "PID_FILE=%SCRIPT_DIR%dataRoomServer.pid"
set "FOUND_PID_LIST="

if exist "%PID_FILE%" (
  set /p FOUND_PID_LIST=<"%PID_FILE%"
)

for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$pidFile = '%PID_FILE%'; $pids = @(); if (Test-Path $pidFile) { $raw = Get-Content $pidFile -ErrorAction SilentlyContinue; if ($raw) { $pids += $raw.Trim() } }; $pids += Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^java(?:w)?\.exe$' -and $_.CommandLine -match 'dataRoomServer\.jar' } | Select-Object -ExpandProperty ProcessId; $pids | Where-Object { $_ } | Sort-Object -Unique | ForEach-Object { $_ }"`) do (
  if defined FOUND_PID_LIST (
    set "FOUND_PID_LIST=!FOUND_PID_LIST! %%i"
  ) else (
    set "FOUND_PID_LIST=%%i"
  )
)

if not defined FOUND_PID_LIST (
  echo %JAR_NAME% is not running.
  exit /b 0
)

for %%i in (%FOUND_PID_LIST%) do (
  taskkill /pid %%i /t >nul 2>&1
  if errorlevel 1 (
    taskkill /f /pid %%i /t >nul 2>&1
  )
)

del /f /q "%PID_FILE%" >nul 2>&1
echo %JAR_NAME% stopped.
exit /b 0
