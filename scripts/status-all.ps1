# CyberShield AI - Full Stack Service Status Checker
[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

$RootDir = (Resolve-Path "$PSScriptRoot\..").Path

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "             CYBERSHIELD AI - SERVICES STATUS               " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

function Test-PortOpen([string]$hostName, [int]$port, [int]$timeoutMs = 1000) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $iar = $tcp.BeginConnect($hostName, $port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne($timeoutMs, $false)
        if ($wait) {
            $tcp.EndConnect($iar)
            $tcp.Close()
            return $true
        } else {
            $tcp.Close()
            return $false
        }
    } catch {
        return $false
    }
}

function Test-HttpEndpoint([string]$url, [int]$timeoutSec = 2) {
    try {
        $req = [System.Net.HttpWebRequest]::Create($url)
        $req.Timeout = $timeoutSec * 1000
        $req.Method = "GET"
        $resp = $req.GetResponse()
        $code = [int]$resp.StatusCode
        $resp.Close()
        return @{ Success = $true; Code = $code }
    } catch [System.Net.WebException] {
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
            $_.Exception.Response.Close()
            return @{ Success = $true; Code = $code }
        }
        return @{ Success = $false; Code = 0 }
    } catch {
        return @{ Success = $false; Code = 0 }
    }
}

# 1. Docker Engine
$dockerOk = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerOk = $true }
} catch {}

if ($dockerOk) {
    Write-Host "  Docker Daemon:   [OK] RUNNING" -ForegroundColor Green
} else {
    Write-Host "  Docker Daemon:   [X] STOPPED / NOT RESPONDING" -ForegroundColor Red
}

# 2. Database & Docker Compose Containers
$containers = @(
    @{ Name = "cti-postgres";   Display = "PostgreSQL";    Port = 5432 },
    @{ Name = "cti-mongodb";    Display = "MongoDB";       Port = 27017 },
    @{ Name = "cti-redis";      Display = "Redis";         Port = 6379 },
    @{ Name = "cti-mongo-express"; Display = "Mongo Express"; Port = 8081 },
    @{ Name = "cti-ml-service"; Display = "ML Service (FastAPI)"; Port = 8000 }
)

if ($dockerOk) {
    foreach ($c in $containers) {
        $status = ""
        $health = ""
        try {
            $status = (docker inspect --format="{{.State.Status}}" $c.Name 2>$null)
            if ($status) { $status = $status.Trim() }
            $health = (docker inspect --format="{{.State.Health.Status}}" $c.Name 2>$null)
            if ($health) { $health = $health.Trim() }
        } catch {}

        $portActive = Test-PortOpen "localhost" $c.Port

        $displayName = ($c.Display + ":").PadRight(18)
        if ($health -eq "healthy") {
            Write-Host "  $displayName [OK] HEALTHY (Port $($c.Port))" -ForegroundColor Green
        } elseif ($status -eq "running" -or $portActive) {
            Write-Host "  $displayName [OK] RUNNING (Port $($c.Port))" -ForegroundColor Green
        } elseif ($status -ne "" -and $status -ne $null) {
            Write-Host "  $displayName [!] $status (Port $($c.Port))" -ForegroundColor Yellow
        } else {
            Write-Host "  $displayName [X] STOPPED" -ForegroundColor Red
        }
    }
} else {
    foreach ($c in $containers) {
        $displayName = ($c.Display + ":").PadRight(18)
        $portActive = Test-PortOpen "localhost" $c.Port
        if ($portActive) {
            Write-Host "  $displayName [OK] PORT LISTENING (Port $($c.Port))" -ForegroundColor Green
        } else {
            Write-Host "  $displayName [X] STOPPED" -ForegroundColor Red
        }
    }
}

# 3. ML Service API Check
$mlHttp = Test-HttpEndpoint "http://localhost:8000/health"
$mlDisplay = "ML Service API:".PadRight(18)
if ($mlHttp.Success) {
    Write-Host "  $mlDisplay [OK] RESPONDING (HTTP $($mlHttp.Code) at http://localhost:8000/health)" -ForegroundColor Green
} else {
    Write-Host "  $mlDisplay [X] NOT RESPONDING" -ForegroundColor Red
}

# 4. Backend Check
$backendPort = Test-PortOpen "localhost" 3001
$backendHttp = Test-HttpEndpoint "http://localhost:3001/api/auth/me"
$backendDisplay = "Backend (NestJS):".PadRight(18)
if ($backendHttp.Success) {
    Write-Host "  $backendDisplay [OK] READY (Port 3001, HTTP $($backendHttp.Code) at http://localhost:3001/api)" -ForegroundColor Green
} elseif ($backendPort) {
    Write-Host "  $backendDisplay [!] PORT LISTENING (Port 3001, Initializing)" -ForegroundColor Yellow
} else {
    Write-Host "  $backendDisplay [X] STOPPED" -ForegroundColor Red
}

# 5. Frontend Check
$frontendPort = Test-PortOpen "localhost" 3000
$frontendHttp = Test-HttpEndpoint "http://localhost:3000"
$frontendDisplay = "Frontend (Next):".PadRight(18)
if ($frontendHttp.Success) {
    Write-Host "  $frontendDisplay [OK] READY (Port 3000, HTTP $($frontendHttp.Code) at http://localhost:3000)" -ForegroundColor Green
} elseif ($frontendPort) {
    Write-Host "  $frontendDisplay [!] PORT LISTENING (Port 3000, Compiling)" -ForegroundColor Yellow
} else {
    Write-Host "  $frontendDisplay [X] STOPPED" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
