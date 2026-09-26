@echo off
setlocal
title CyberShield AI - Startup
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-all.ps1" %*
set SCRIPT_EXIT_CODE=%ERRORLEVEL%

if %SCRIPT_EXIT_CODE% neq 0 (
    echo.
    echo [ERROR] Startup encountered an issue. Exit code: %SCRIPT_EXIT_CODE%
    if not "%CYBERSHIELD_NO_PAUSE%"=="1" pause
    exit /b %SCRIPT_EXIT_CODE%
)

if not "%CYBERSHIELD_NO_PAUSE%"=="1" (
    for %%I in (%cmdcmdline%) do if /i "%%~I"=="/c" (
        echo.
        echo Press any key to close this launcher window. Services will continue running in background.
        pause >nul
    )
)
exit /b %SCRIPT_EXIT_CODE%
