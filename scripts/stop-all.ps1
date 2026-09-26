# CyberShield AI - Full Stack Shutdown Script
[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

$RootDir = (Resolve-Path "$PSScriptRoot\..").Path

Write-Host ""
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "         CYBERSHIELD AI - SYSTEM SHUTDOWN INITIALIZER        " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host ""

# Helper to stop processes listening on a specific TCP port
function Stop-PortListener([int]$port, [string]$serviceName) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($p in $pids) {
                if ($p -and $p -gt 0) {
                    Write-Host "  Stopping $serviceName (PID: $p on port $port)..." -ForegroundColor Gray
                    Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                }
            }
            Write-Host "  [OK] $serviceName stopped on port $port." -ForegroundColor Green
        } else {
            Write-Host "  [--] $serviceName was not running on port $port." -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "  [!] Notice: could not query port $port ($($_.Exception.Message))" -ForegroundColor DarkGray
    }
}

# 1. Stop Frontend window & process
Write-Host "[1/3] Stopping Frontend (Next.js)..." -ForegroundColor Cyan
taskkill /fi "WINDOWTITLE eq CyberShield Frontend*" /f /t >$null 2>&1
Stop-PortListener -port 3000 -serviceName "Frontend"

# 2. Stop Backend window & process
Write-Host ""
Write-Host "[2/3] Stopping Backend (NestJS)..." -ForegroundColor Cyan
taskkill /fi "WINDOWTITLE eq CyberShield Backend*" /f /t >$null 2>&1
Stop-PortListener -port 3001 -serviceName "Backend"

# 3. Stop Docker Compose containers
Write-Host ""
Write-Host "[3/3] Stopping Docker Compose infrastructure..." -ForegroundColor Cyan
Push-Location $RootDir
try {
    $dockerCheck = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        docker compose down
        Write-Host "  [OK] Docker Compose containers stopped and cleaned." -ForegroundColor Green
    } else {
        Write-Host "  [--] Docker daemon is not active; skipping docker compose down." -ForegroundColor DarkGray
    }
} catch {
    Write-Host "  [!] Error running docker compose down: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "              CYBERSHIELD AI - SHUTDOWN COMPLETE            " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  All development servers and containers have been stopped." -ForegroundColor White
Write-Host "  Database volumes remain intact and will resume on start." -ForegroundColor Gray
Write-Host ""
