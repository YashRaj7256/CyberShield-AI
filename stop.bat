@echo off
setlocal
title CyberShield AI - Shutdown
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-all.ps1" %*
set SCRIPT_EXIT_CODE=%ERRORLEVEL%

if not "%CYBERSHIELD_NO_PAUSE%"=="1" (
    for %%I in (%cmdcmdline%) do if /i "%%~I"=="/c" (
        echo.
        echo Press any key to close this window...
        pause >nul
    )
)
exit /b %SCRIPT_EXIT_CODE%
