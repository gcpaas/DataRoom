@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "JAR_NAME=dataRoomServer.jar"
set "JAR_PATH=%SCRIPT_DIR%%JAR_NAME%"
set "PID_FILE=%SCRIPT_DIR%dataRoomServer.pid"

if defined JAVA_HOME (
  set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
  if not exist "%JAVA_CMD%" (
    echo Java runtime not found: %JAVA_HOME%\bin\java.exe
    exit /b 1
  )
) else (
  set "JAVA_CMD=java"
  where java >nul 2>&1
  if errorlevel 1 (
    echo Java runtime not found. Please set JAVA_HOME or add java to PATH.
    exit /b 1
  )
)

if not exist "%JAR_PATH%" (
  echo Jar not found: %JAR_PATH%
  exit /b 1
)

if exist "%PID_FILE%" (
  set /p EXISTING_PID=<"%PID_FILE%"
  if defined EXISTING_PID (
    powershell -NoProfile -Command "$p = Get-CimInstance Win32_Process -Filter \"ProcessId = %EXISTING_PID%\" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match 'dataRoomServer\.jar' }; if ($p) { exit 0 } else { exit 1 }"
    if not errorlevel 1 (
      echo %JAR_NAME% is already running. PID=%EXISTING_PID%
      exit /b 0
    )
  )
  del /f /q "%PID_FILE%" >nul 2>&1
)

pushd "%SCRIPT_DIR%"
start "" /b cmd /c ""%JAVA_CMD%" -jar "%JAR_NAME%" > nul 2>&1"
timeout /t 2 /nobreak >nul

for /f %%i in ('powershell -NoProfile -Command "(Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^java(?:w)?\.exe$' -and $_.CommandLine -match 'dataRoomServer\.jar' } | Sort-Object CreationDate -Descending | Select-Object -First 1 -ExpandProperty ProcessId)"') do (
  set "PID=%%i"
)

popd

if not defined PID (
  echo %JAR_NAME% start command issued, but PID was not detected.
  exit /b 1
)

>%PID_FILE% echo %PID%
echo %JAR_NAME% started. PID=%PID%
exit /b 0
