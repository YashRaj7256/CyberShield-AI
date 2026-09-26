# CyberShield AI - One-Command Startup & Operation Guide

This guide explains how to start, monitor, and cleanly shut down the complete CyberShield AI platform on Windows with a single click or command.

---

## Architecture Overview

```text
CyberShield AI
      |
Double-click `start.bat`
      |
[1] Docker Desktop & Daemon Verification (auto-starts Docker if needed)
      |
[2] Docker Compose Infrastructure
    ├── PostgreSQL      (Port 5432)   [DB: cti-postgres]
    ├── MongoDB         (Port 27017)  [DB: cti-mongodb]
    ├── Redis           (Port 6379)   [Cache/Queue: cti-redis]
    ├── Mongo Express   (Port 8081)   [Web UI: cti-mongo-express]
    └── ML Service      (Port 8000)   [FastAPI: cti-ml-service]
      |
[3] Healthcheck Gate (Waits until DBs & ML Service are healthy)
      |
[4] Backend Terminal Window (NestJS `npm run start:dev` on Port 3001)
      |
[5] Backend Availability Gate (Waits for HTTP response on Port 3001)
      |
[6] Frontend Terminal Window (Next.js Turbopack `npm run dev` on Port 3000)
      |
[7] Browser Launch (`http://localhost:3000`)
      |
System Ready
```

---

## 1. Quick Start (One Command / Double Click)

### Starting the Project
* **Option A (Mouse):** Double-click [`start.bat`](start.bat) in the project root folder.
* **Option B (Terminal):**
  ```cmd
  .\start.bat
  ```

### What Happens Automatically:
1. **Docker Check**: Detects if Docker daemon is active. If stopped, attempts to launch Docker Desktop and polls until operational.
2. **Docker Compose Launch**: Runs `docker compose up -d` to spin up PostgreSQL, MongoDB, Redis, Mongo Express, and the ML Service.
3. **Health Validation**: Inspects native container health probes (`pg_isready`, `mongosh ping`, `redis-cli ping`, and `GET /health` for ML Service).
4. **Backend Launch**: Spawns an independent terminal window titled **`CyberShield Backend`** running `npm run start:dev`.
5. **Backend Health Check**: Polls until the backend NestJS HTTP server is accepting requests.
6. **Frontend Launch**: Spawns an independent terminal window titled **`CyberShield Frontend`** running `npm run dev`.
7. **Frontend Health Check**: Polls until Next.js compilation completes.
8. **Browser Launch**: Automatically opens `http://localhost:3000` in your default web browser.

---

## 2. Checking Service Status

To inspect whether all services and databases are healthy and operational:

* **Double-click:** [`status.bat`](status.bat)
* **Or run from terminal:**
  ```cmd
  .\status.bat
  ```

### Example Status Output:
```text
============================================================
             CYBERSHIELD AI - SERVICES STATUS               
============================================================

  Docker Daemon:         [OK] RUNNING
  PostgreSQL:            [OK] HEALTHY (Port 5432)
  MongoDB:               [OK] HEALTHY (Port 27017)
  Redis:                 [OK] HEALTHY (Port 6379)
  Mongo Express:         [OK] RUNNING (Port 8081)
  ML Service (FastAPI):  [OK] HEALTHY (Port 8000)
  ML Service API:        [OK] RESPONDING (HTTP 200 at http://localhost:8000/health)
  Backend (NestJS):      [OK] READY (Port 3001, HTTP 401 at http://localhost:3001/api)
  Frontend (Next):       [OK] READY (Port 3000, HTTP 200 at http://localhost:3000)

============================================================
```

---

## 3. Stopping the Project Cleanly

To stop all services without losing your database data:

* **Double-click:** [`stop.bat`](stop.bat)
* **Or run from terminal:**
  ```cmd
  .\stop.bat
  ```

### What It Cleans Up:
1. **Frontend**: Closes the `CyberShield Frontend` terminal and terminates any lingering processes on port 3000.
2. **Backend**: Closes the `CyberShield Backend` terminal and terminates any lingering processes on port 3001.
3. **Docker Infrastructure**: Executes `docker compose down` to stop and remove containers while preserving persistent volumes (`postgres_data`, `mongo_data`, `redis_data`, `ml_models`).

---

## 4. Port & Service Reference Table

| Service | Port | Management / Host | Health Check Endpoint / Command |
| :--- | :--- | :--- | :--- |
| **Frontend** | `3000` | Next.js (Turbopack) | `http://localhost:3000` |
| **Backend** | `3001` | NestJS Dev Server | `http://localhost:3001/api` |
| **ML Service** | `8000` | FastAPI / Uvicorn (Docker) | `http://localhost:8000/health` |
| **Mongo Express** | `8081` | Web UI (Docker) | `http://localhost:8081` |
| **PostgreSQL** | `5432` | Docker (`cti-postgres`) | `pg_isready -U cti_admin -d cyber_threat_intel` |
| **MongoDB** | `27017` | Docker (`cti-mongodb`) | `mongosh --quiet ping` |
| **Redis** | `6379` | Docker (`cti-redis`) | `redis-cli -a cti_redis_2024 ping` |

> [!IMPORTANT]
> The Python FastAPI ML Service is already containerized within Docker Compose under `cti-ml-service` (mapping host port 8000 to container port 8000). Starting `start.bat` automatically manages it through Docker Compose. Do **not** run local Uvicorn concurrently, as that would cause a port conflict on port 8000.

---

## 5. Script File Locations

* **Root Scripts (Double-Clickable / Command Prompt)**:
  * [`start.bat`](start.bat) — One-click full-stack launcher
  * [`stop.bat`](stop.bat) — Clean shutdown script
  * [`status.bat`](status.bat) — Real-time component health inspector
* **Engine Scripts (PowerShell Core Execution)**:
  * [`scripts/start-all.ps1`](scripts/start-all.ps1) — Startup coordinator with socket & HTTP health checking
  * [`scripts/stop-all.ps1`](scripts/stop-all.ps1) — Port-listener termination & compose teardown
  * [`scripts/status-all.ps1`](scripts/status-all.ps1) — Container & network socket diagnostic scanner
