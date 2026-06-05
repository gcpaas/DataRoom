@echo off
setlocal

REM 当前批处理文件所在目录，用于定位同目录下的 release.ps1
set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%release.ps1"

REM 通过 PowerShell 执行真正的发布逻辑，绕过本机执行策略限制
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

REM 透传 PowerShell 的退出码，便于 CI 或命令行判断发布是否成功
set "EXIT_CODE=%ERRORLEVEL%"

endlocal & exit /b %EXIT_CODE%
