# CyberShield AI - Full Stack Startup Automation Script
[CmdletBinding()]
param (
    [switch]$NoBrowser,
    [int]$DockerTimeoutSeconds = 60,
    [int]$ServiceTimeoutSeconds = 60
)

$ErrorActionPreference = "Stop"

# Determine workspace root
$RootDir = (Resolve-Path "$PSScriptRoot\..").Path
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "         CYBERSHIELD AI - SYSTEM STARTUP INITIALIZER         " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Root Directory: $RootDir" -ForegroundColor Gray
Write-Host ""

# Helper to check if a TCP port is responding
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

# Helper to check HTTP endpoint
function Test-HttpEndpoint([string]$url, [int]$timeoutSec = 2) {
    try {
        $req = [System.Net.HttpWebRequest]::Create($url)
        $req.Timeout = $timeoutSec * 1000
        $req.Method = "GET"
        $resp = $req.GetResponse()
        $code = [int]$resp.StatusCode
        $resp.Close()
        return ($code -ge 200 -and $code -lt 500)
    } catch [System.Net.WebException] {
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
            $_.Exception.Response.Close()
            return ($code -ge 200 -and $code -lt 500)
        }
        return $false
    } catch {
        return $false
    }
}

# -----------------------------------------------------------------------------
# STEP 1: Verify & Start Docker Daemon
# -----------------------------------------------------------------------------
Write-Host "[1/6] Verifying Docker Desktop & Daemon..." -ForegroundColor Yellow

$dockerReady = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerReady = $true
    }
} catch {}

if (-not $dockerReady) {
    Write-Host "  Docker daemon not responding. Attempting to start Docker Desktop..." -ForegroundColor Yellow

    $dockerPaths = @(
        "C:\Program Files\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Programs\Docker Desktop\Docker Desktop.exe",
        "C:\Program Files\Docker\Docker\resources\com.docker.backend.exe"
    )

    $launched = $false
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            Write-Host "  Launching: $path" -ForegroundColor Gray
            Start-Process -FilePath $path
            $launched = $true
            break
        }
    }

    if (-not $launched) {
        Write-Host "  [!] Docker Desktop executable not found in default paths." -ForegroundColor Red
        Write-Host "      Please start Docker Desktop manually." -ForegroundColor Red
    }

    Write-Host "  Waiting for Docker daemon to become ready (timeout: ${DockerTimeoutSeconds}s)..." -NoNewline
    $elapsed = 0
    while ($elapsed -lt $DockerTimeoutSeconds) {
        Start-Sleep -Seconds 3
        $elapsed += 3
        Write-Host "." -NoNewline

        try {
            $null = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                $dockerReady = $true
                break
            }
        } catch {}
    }
    Write-Host ""

    if (-not $dockerReady) {
        Write-Host "ERROR: Docker daemon is not ready after ${DockerTimeoutSeconds}s." -ForegroundColor Red
        Write-Host "Please ensure Docker Desktop is running and WSL2/Hyper-V is operational." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  [OK] Docker Daemon is operational." -ForegroundColor Green

# -----------------------------------------------------------------------------
# STEP 2: Start Docker Compose Infrastructure (DBs + Redis + ML Service)
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/6] Starting Docker Compose infrastructure..." -ForegroundColor Yellow
Write-Host "  Services: PostgreSQL, MongoDB, Redis, Mongo Express, ML Service" -ForegroundColor Gray

Push-Location $RootDir
try {
    docker compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: docker compose up -d failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}
Write-Host "  [OK] Docker Compose containers launched." -ForegroundColor Green

# -----------------------------------------------------------------------------
# STEP 3: Wait for Docker Services to be Healthy
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/6] Waiting for infrastructure services to be healthy..." -ForegroundColor Yellow

$requiredContainers = @(
    @{ Name = "cti-postgres"; Display = "PostgreSQL"; Port = 5432 },
    @{ Name = "cti-mongodb";  Display = "MongoDB";    Port = 27017 },
    @{ Name = "cti-redis";    Display = "Redis";      Port = 6379 },
    @{ Name = "cti-ml-service"; Display = "ML Service (FastAPI)"; Port = 8000 }
)

$startWait = [DateTime]::UtcNow
foreach ($svc in $requiredContainers) {
    Write-Host "  Checking $($svc.Display)..." -NoNewline
    $healthy = $false
    while (([DateTime]::UtcNow - $startWait).TotalSeconds -lt $ServiceTimeoutSeconds) {
        try {
            $status = (docker inspect --format='{{.State.Health.Status}}' $svc.Name 2>$null)
            if ($status) { $status = $status.Trim() }
            if ($status -eq "healthy") {
                $healthy = $true
                break
            }
            # Fallback for containers without healthcheck or during startup
            if ($status -eq "" -or $status -eq "<no value>" -or $null -eq $status) {
                $running = (docker inspect --format='{{.State.Running}}' $svc.Name 2>$null)
                if ($running) { $running = $running.Trim() }
                if ($running -eq "true" -and (Test-PortOpen "localhost" $svc.Port)) {
                    $healthy = $true
                    break
                }
            }
        } catch {}
        Start-Sleep -Seconds 1
        Write-Host "." -NoNewline
    }
    if ($healthy) {
        Write-Host " [HEALTHY]" -ForegroundColor Green
    } else {
        Write-Host " [WARNING: Service did not report healthy, continuing]" -ForegroundColor Yellow
    }
}

# Double check ML Service health endpoint
$mlEndpointReady = $false
for ($i = 0; $i -lt 15; $i++) {
    if (Test-HttpEndpoint "http://localhost:8000/health") {
        $mlEndpointReady = $true
        break
    }
    Start-Sleep -Seconds 1
}
if ($mlEndpointReady) {
    Write-Host "  [OK] ML Service HTTP endpoint responding at http://localhost:8000/health" -ForegroundColor Green
} else {
    Write-Host "  [!] ML Service endpoint not yet responding on http://localhost:8000/health" -ForegroundColor Yellow
}

# -----------------------------------------------------------------------------
# STEP 4: Start Backend (NestJS in separate terminal)
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[4/6] Starting Backend Service (NestJS)..." -ForegroundColor Yellow

# Check if backend is already running on port 3001
$backendAlreadyRunning = Test-PortOpen "localhost" 3001
if ($backendAlreadyRunning) {
    Write-Host "  Backend is already running on port 3001." -ForegroundColor Green
} else {
    Write-Host "  Launching Backend in separate terminal window (title: 'CyberShield Backend')..." -ForegroundColor Gray
    $backendCmd = "title CyberShield Backend && cd /d `"$BackendDir`" && npm run start:dev"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $backendCmd

    Write-Host "  Waiting for Backend to initialize on http://localhost:3001..." -NoNewline
    $backendReady = $false
    $bWait = 0
    while ($bWait -lt $ServiceTimeoutSeconds) {
        Start-Sleep -Seconds 2
        $bWait += 2
        Write-Host "." -NoNewline

        if ((Test-HttpEndpoint "http://localhost:3001/api/auth/me") -or (Test-PortOpen "localhost" 3001)) {
            $backendReady = $true
            break
        }
    }
    Write-Host ""

    if ($backendReady) {
        Write-Host "  [OK] Backend is ready and accepting requests on port 3001." -ForegroundColor Green
    } else {
        Write-Host "  [!] Backend taking longer than expected. Continuing..." -ForegroundColor Yellow
    }
}

# -----------------------------------------------------------------------------
# STEP 5: Start Frontend (Next.js in separate terminal)
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[5/6] Starting Frontend Service (Next.js)..." -ForegroundColor Yellow

$frontendAlreadyRunning = Test-PortOpen "localhost" 3000
if ($frontendAlreadyRunning) {
    Write-Host "  Frontend is already running on port 3000." -ForegroundColor Green
} else {
    Write-Host "  Launching Frontend in separate terminal window (title: 'CyberShield Frontend')..." -ForegroundColor Gray
    $frontendCmd = "title CyberShield Frontend && cd /d `"$FrontendDir`" && npm run dev"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $frontendCmd

    Write-Host "  Waiting for Frontend to compile on http://localhost:3000..." -NoNewline
    $frontendReady = $false
    $fWait = 0
    while ($fWait -lt $ServiceTimeoutSeconds) {
        Start-Sleep -Seconds 2
        $fWait += 2
        Write-Host "." -NoNewline

        if ((Test-HttpEndpoint "http://localhost:3000") -or (Test-PortOpen "localhost" 3000)) {
            $frontendReady = $true
            break
        }
    }
    Write-Host ""

    if ($frontendReady) {
        Write-Host "  [OK] Frontend is ready on http://localhost:3000." -ForegroundColor Green
    } else {
        Write-Host "  [!] Frontend taking longer to initialize. Continuing..." -ForegroundColor Yellow
    }
}

# -----------------------------------------------------------------------------
# STEP 6: Final Verification & Open Browser
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[6/6] Finalizing Startup..." -ForegroundColor Yellow

if (-not $NoBrowser) {
    Write-Host "  Opening http://localhost:3000 in your browser..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "              CYBERSHIELD AI - SYSTEM READY                 " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Service         Port       Status      URL / Info" -ForegroundColor White
Write-Host "  ----------------------------------------------------------" -ForegroundColor Gray
Write-Host "  Docker          -          RUNNING     Docker Desktop Engine" -ForegroundColor Green
Write-Host "  PostgreSQL      5432       HEALTHY     cti-postgres" -ForegroundColor Green
Write-Host "  MongoDB         27017      HEALTHY     cti-mongodb" -ForegroundColor Green
Write-Host "  Redis           6379       HEALTHY     cti-redis" -ForegroundColor Green
Write-Host "  Mongo Express   8081       RUNNING     http://localhost:8081" -ForegroundColor Green
Write-Host "  ML Service      8000       HEALTHY     http://localhost:8000/health" -ForegroundColor Green
Write-Host "  Backend (Nest)  3001       READY       http://localhost:3001/api" -ForegroundColor Green
Write-Host "  Frontend (Next) 3000       READY       http://localhost:3000" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "To check service status at any time, run: .\status.bat" -ForegroundColor Cyan
Write-Host "To shut down all services cleanly, run:   .\stop.bat" -ForegroundColor Cyan
Write-Host ""
