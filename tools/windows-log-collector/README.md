# Windows Security Log Collector

Real-time local Windows security telemetry collector for CyberShield AI.

## Overview

The collector extracts genuine security and system events directly from Windows Event Log channels, normalizes them strictly according to the platform's `SecurityLog` schema, and ingests them into MongoDB via the existing NestJS API (`/api/logs/bulk`).

```
Windows Event Logs (Security / Defender / System)
                 │
                 ▼
      tools/windows-log-collector
   (wevtutil / PowerShell XML reader)
                 │
                 ▼
          Normalizer Engine
 (Maps to SecurityLog: IP, ports, severity, eventType)
                 │
                 ▼
     NestJS Ingestion API (POST /api/logs/bulk)
                 │
                 ▼
       MongoDB (`security_logs`)
                 │
                 ▼
      BullMQ Logs Processor & Worker
                 │
                 ▼
    FastAPI ML Service (/api/v1/detect, /api/v1/predict)
                 │
                 ▼
        Next.js Dashboard & Predictions UI
```

## Features

- **Zero External Dependencies**: Uses only standard Python 3 (`urllib`, `xml.etree`, `subprocess`, `json`, `ctypes`). No `pip install` required.
- **Elevation Detection**:
  - **Administrator mode**: Queries Windows `Security` channel (Event IDs 4624, 4625, 4634, 4648, 4672, 4688, 4720, 4726, 4740).
  - **Standard user mode**: Gracefully collects antivirus & operational security telemetry from `Microsoft-Windows-Windows Defender/Operational` (1116, 1117, 1000, 1001, 5007) and `System` (7045, 10016, 7036).
- **Watermark Duplicate Prevention**: Stores high-watermark record IDs in `.collector_state.json` to prevent re-uploading events.
- **Safe Authentication**: Authenticates with NestJS backend via JWT (`POST /api/auth/login`) with automatic renewal.

## Usage

### 1. Test run (Dry-Run mode)
Inspect normalized events locally without sending to the backend:
```powershell
python collector.py --dry-run
```

### 2. Single collection pass
Collect recent Windows events, ingest them into MongoDB, and exit:
```powershell
python collector.py --once
```

### 3. Continuous monitoring (Watch mode)
Continuously poll Windows event channels every 10 seconds:
```powershell
python collector.py --watch --interval 10
```

### Elevated Administrator Execution (For Security Event Log 4624/4625/etc.)
To read the protected Windows `Security` log channel:
1. Open PowerShell or Command Prompt as **Administrator** (`Run as Administrator`).
2. Navigate to this directory and run:
```powershell
python collector.py --watch
```

## Configuration

Settings can be specified via CLI arguments or environment variables (`.env` file):

| Variable | CLI Flag | Default | Description |
|---|---|---|---|
| `BACKEND_URL` | `--backend-url` | `http://localhost:3001` | NestJS backend URL |
| `COLLECTOR_INTERVAL` | `--interval` | `10` | Poll interval in seconds |
| `COLLECTOR_USERNAME` | `--username` | `admin@cti.com` | API user (ADMIN or ANALYST) |
| `COLLECTOR_PASSWORD` | `--password` | `Admin@123` | API user password |
| `BATCH_SIZE` | `--limit` | `50` | Max events per channel per run |
