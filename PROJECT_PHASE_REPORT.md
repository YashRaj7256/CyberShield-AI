# 🛡️ CyberShield AI — Complete Phase-by-Phase Project Master Document (v2.4)

* **Full Title:** AI-Powered Cyber Threat Intelligence Platform for Real-Time Anomaly Detection and Attack Prediction  
* **Short Name:** CyberShield AI  
* **Architecture:** 3-Tier Microservices with Polyglot Persistence (Next.js 16 + NestJS 11 + Python FastAPI + Docker)  
* **Academic Program:** B.Tech Major Project — Information Technology  
* **Current Version:** v2.4 (Active Development — ~88% Overall Completion)  
* **Last Updated:** September 2026  

---

## 🏗️ Technical Architecture & Monorepo Overview

CyberShield AI is architected as an enterprise-grade, polyglot microservices platform. High-frequency telemetry ingestion is completely decoupled from relational state and analytical machine learning pipelines.

```text
cyber-threat-intel/
├── backend/          # NestJS 11 REST API, BullMQ Worker, Prisma v6, Mongoose, Socket.IO (Port 3001)
├── frontend/         # Next.js 16 (App Router), React 19, Tailwind CSS 4, Zustand, Leaflet, Recharts (Port 3000)
├── ml-service/       # Python 3.11 FastAPI, Scikit-Learn, SHAP, Joblib, Attack Predictor (Port 8000)
├── docker-compose.yml# 5 Orchestrated Containers (Postgres 16, Mongo 7, Redis 7, Mongo-Express, ML-Service)
├── ML_AUDIT_AND_ARCHITECTURE_REPORT.md # Technical ML Audit & Supervised Classification Roadmap
├── PROJECT_PHASE_REPORT.md             # Project Master Phase Report (Current)
└── .env              # Centralized environment configuration
```

### Container & Service Topology

| Service | Technology Stack | Port | Purpose & Storage Responsibility |
|---|---|---|---|
| **Frontend** | Next.js 16.2.9, React 19, Tailwind v4, Zustand | `3000` | Dark glassmorphic SOC command center, spatial maps, logs explorer, landing page |
| **Backend API** | NestJS 11.0.1, Express, Passport, BullMQ | `3001` | REST API, JWT authentication, RBAC, background job orchestration |
| **ML Engine** | Python 3.11, FastAPI, Scikit-Learn, SHAP | `8000` | Dual-model anomaly ensemble, SHAP explainability, weighted threat scoring |
| **PostgreSQL** | PostgreSQL 16 Alpine (via Prisma v6.19.3) | `5432` | Relational ACID store: `User`, `Alert`, `ThreatScore`, `BlockedIP`, `AuditLog` |
| **MongoDB** | MongoDB 7.0 (via Mongoose v9.7.1) | `27017` | High-throughput document lake for raw polymorphic security logs |
| **Redis** | Redis 7.0 Alpine (via ioredis v5.11) | `6379` | In-memory message broker & job queue state for BullMQ |
| **Mongo Express** | Mongo Express Web UI | `8081` | Administrative inspection tool for raw MongoDB document lake |

---

## 📋 PHASE 1: Foundation, Infrastructure & Core Setup (Status: ✅ COMPLETED — 100%)

**Goal:** Establish monorepo scaffolding, containerized polyglot databases, database schemas, authentication/authorization, base SOC UI shell, and realistic dataset seeding.

### Key Deliverables & Implementation:
1. **Containerized Polyglot Infrastructure (`docker-compose.yml`):**
   - **PostgreSQL 16 Alpine (`cti-postgres`):** ACID storage for structured entities (alerts, users, blocked IPs, audit logs).
   - **MongoDB 7 (`cti-mongodb`):** Flexible document store data lake for raw polymorphic security logs.
   - **Redis 7 Alpine (`cti-redis`):** Queue broker for asynchronous log analysis.
   - **Mongo Express (`cti-mongo-express`):** Web GUI on port 8081 for direct data lake inspection.
   - **FastAPI ML Service (`cti-ml-service`):** Isolated Python runtime with mounted `/app/models` volume.
2. **Database Schemas & Dual-ORM Setup:**
   - **PostgreSQL (Prisma ORM v6.19.3):** 7 models (`User`, `Alert`, `ThreatScore`, `BlockedIP`, `AuditLog`, `Report`, `NotificationSetting`) and 13 strict enums (`Role`, `AlertType`, `Severity`, `AlertStatus`, `ThreatCategory`, etc.).
   - **MongoDB (Mongoose ODM v9.7.1):** `securitylogs` collection with 25+ dynamic fields (IPs, ports, protocols, geo-coordinates, ML anomaly scores, raw payloads).
3. **Authentication & Role-Based Access Control (RBAC):**
   - Dual-token lifecycle: 15-minute Access Token + 7-day Refresh Token.
   - Password hashing: `bcrypt` with 12 salt rounds.
   - Passport strategies: `LocalStrategy` (credentials validation) + `JwtStrategy` (Bearer token guard).
   - Route protection: `@Roles('ADMIN', 'ANALYST', 'VIEWER')` decorator with `RolesGuard`.
4. **Database Seeding Engine (`backend/prisma/seed.ts`):**
   - Seeded with **10,000 realistic security logs** spanning a 30-day temporal window (70% normal, 20% suspicious, 10% malicious).
   - Seeded 150 PostgreSQL alerts, 50 threat scores, 10 blocked IPs, and 50 audit logs.
   - Default seeded accounts:
     - **Admin:** `admin@cti.com` / `Admin@123` (`ADMIN`)
     - **Analyst:** `analyst@cti.com` / `Analyst@123` (`ANALYST`)
     - **Viewer:** `viewer@cti.com` / `Viewer@123` (`VIEWER`)

---

## 🧠 PHASE 2: AI/ML Engine, Queue Pipeline & SOC Dashboard Integration (Status: ✅ COMPLETED — 100%)

**Goal:** Build the Python machine learning intelligence engine, asynchronous task queue, and wire live backend data into the Next.js SOC dashboard.

### Phase 2.1 — AI/ML Microservice & Asynchronous Processing
1. **8-Dimensional Feature Extraction Matrix (`preprocessing.py`):**
   - `hour` (0–23), `is_login_failure` (0/1), `protocol_risk` (0.1–0.8), `source_weight` (0.3–0.8), `country_risk` (0.1–1.0), `severity_level` (1–4), `port_risk` (0.1–0.9), `action_type` (0.0–0.9).
   - Feature scaling via `sklearn.preprocessing.StandardScaler`.
2. **Dual-Model ML Anomaly Ensemble (`anomaly_detector.py`):**
   - **Isolation Forest:** 200 random decision trees (`contamination=0.05`) measuring isolation path lengths in feature space.
   - **One-Class SVM:** RBF non-linear kernel (`nu=0.05`) defining a support vector boundary around normal traffic patterns.
   - Ensemble combines decision outputs to yield a normalized anomaly score $[0.0, 1.0]$.
3. **Composite Weighted Threat Scorer (`threat_scorer.py`):**
   - Formula:
     $$\text{ThreatScore} = \text{round}(35 \cdot A_{\text{score}} + 20 \cdot L_{\text{fail}} + 15 \cdot C_{\text{risk}} + 15 \cdot P_{\text{risk}} + 15 \cdot S_{\text{factor}}) \in [0, 100]$$
   - Risk categorization: `SAFE` (0–19), `LOW_RISK` (20–39), `MEDIUM_RISK` (40–59), `HIGH_RISK` (60–79), `CRITICAL` (80–100).
4. **Explainable AI Engine (XAI) (`explainer.py`):**
   - `shap.TreeExplainer` computing exact feature attributions on the Isolation Forest trees, backed by a deterministic heuristic fallback engine.
5. **Attack Forecasting Predictor Service (`predictor.py`):**
   - 900+ line sliding-window heuristic pattern recognizer forecasting 8 attack scenarios (Brute Force escalation, DDoS, Data Exfiltration, Account Takeover, Lateral Movement, Zero-Day Exploit).
6. **Asynchronous BullMQ Queue Pipeline (`backend/src/jobs/logs.processor.ts`):**
   - Logs saved to MongoDB $\rightarrow$ job ID enqueued to Redis $\rightarrow$ immediate HTTP response ($<20$ms).
   - BullMQ worker consumes job $\rightarrow$ invokes FastAPI `POST /api/v1/detect` $\rightarrow$ updates MongoDB log with scores & SHAP reasons $\rightarrow$ if score $\ge 60$, auto-generates a PostgreSQL `Alert` record.

### Phase 2.2 — Core SOC Dashboard Integration
1. **Overview Dashboard (`frontend/src/app/(dashboard)/overview/page.tsx`):**
   - 6 live metric StatCards (Total Logs, Active Alerts, Critical Threats, High Risk Users, Blocked IPs, Average Threat Score).
   - 4 interactive Recharts visualizations: 30-day Threat Trends, Severity Distribution Donut, Attack Frequency Stacked Bar, and Top Attacking Sources Bar.
2. **Alert Management Module (`frontend/src/app/(dashboard)/alerts/page.tsx`):**
   - Severity filtering tabs (All, Critical, High, Medium, Low).
   - Expandable alert cards displaying SHAP explanation reasons.
   - Action buttons with optimistic UI updates: **Resolve**, **Investigate**, **False Positive** (`PATCH /api/alerts/:id`).
3. **Security Logs Explorer (`frontend/src/app/(dashboard)/logs/page.tsx`):**
   - Debounced multi-dimensional search (IP, keyword, date range, severity, source, protocol, action).
   - Slide-in `LogDetailDrawer` displaying structured metadata and formatted raw JSON payloads.

---

## 🌐 PHASE 3: Spatial Intelligence, Operational Workflows & Bulk Ingestion (Status: 🟢 ~85% COMPLETED)

**Goal:** Provide visual threat geolocation, operational bulk log ingestion, detailed threat entity analytics, and an architectural showcase landing page.

### Completed Deliverables in Phase 3:
1. **Geographical Threat Map (`frontend/src/app/(dashboard)/geo-map/page.tsx`):**
   - **Interactive Leaflet/React-Leaflet Canvas:** World map plotting global cyber attack origins using geolocation metadata (`latitude`, `longitude`, `country`).
   - **Dynamic Ballistic Arcs:** Animated visual flight paths connecting threat sources to defended asset targets.
   - **Pulsing Severity Markers:** Color-coded pins for Critical, High, Medium, and Low severity origins.
   - **Origin Drilldown & Threat Feed Panel (`GeoSidePanel.tsx`):** Displays country threat rankings, active attacks, and origin telemetry.
2. **Security Log Bulk Upload Modal (`frontend/src/components/logs/` & `/logs/page.tsx`):**
   - Drag-and-drop CSV / JSON file uploader dialog.
   - Raw JSON paste input with syntax validation.
   - Direct integration with backend `POST /api/logs/bulk` and client-side `telemetryStore`.
3. **Threat Entity Analysis (`frontend/src/app/(dashboard)/threats/page.tsx`):**
   - Entity risk cards (IP & User targets) displaying multi-factor threat gauges (Anomaly, Failed Logins, Country, Port, Severity).
   - Interactive score distribution charts and entity history timeline.
4. **Architectural Showcase & Landing Page (`frontend/src/app/page.tsx`):**
   - Full-featured landing page with live telemetry metrics counter.
   - Interactive microservices architecture diagram visualizer (`cyber-architecture-visual.tsx`) illustrating traffic flow between Next.js, NestJS, Redis/BullMQ, MongoDB, PostgreSQL, and FastAPI.
   - Brand system integration (`CyberShieldLogo.tsx`).
5. **Automated Security Reports Engine (`frontend/src/app/(dashboard)/reports/page.tsx` & `backend/src/reports/`):**
   - **Cross-Telemetry Aggregation:** Compiles live telemetry from MongoDB `securitylogs` and PostgreSQL (`Alert`, `ThreatScore`, `BlockedIP`).
   - **Multi-Format Export Engine:** High-fidelity PDF executive briefs generated via PDFKit and structured CSV raw audit telemetry sheets.
   - **Interactive SOC Reports Console:** Full dashboard matching the SOC dark glassmorphism design language with live status pills, KPI StatCards, filtering by scope (Daily, Weekly, Monthly, Incident) and format (PDF, CSV).
   - **Live Telemetry Pre-computation:** Instant on-the-fly preview of logs, alerts, critical threats, and threat posture before generating.
   - **In-Depth Report Reader Drawer:** Interactive side drawer displaying executive metrics, severity distribution, top threat vectors, offending IPs, target ports, and actionable SOC remediation checklists.
   - **Authenticated One-Click Downloads:** Direct streaming file download endpoints protected with Bearer JWT authentication.

### Remaining Deliverables in Phase 3:
1. **Attack Predictions UI Page Hookup (`frontend/src/app/(dashboard)/predictions/page.tsx`):**
   - Connect the existing placeholder page to the operational FastAPI `POST /api/v1/predict` endpoint.
   - Render probability circular gauges, time-window countdowns, and SOC countermeasure checklists.

---

## 🔮 PHASE 4: Enterprise Administration, Real-Time Push & Hardening (Status: 🟡 ROADMAP)

**Goal:** Enterprise user administration, persistent WebSocket streaming, system configuration, and production hardening.

1. **User Management Console (`frontend/src/app/(dashboard)/users/page.tsx`):**
   - Connect the UI to the existing NestJS `UsersModule` (`GET /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id`).
   - Role switching modal (`ADMIN`, `ANALYST`, `VIEWER`) and account deactivation toggles.
2. **System Settings Panel (`frontend/src/app/(dashboard)/settings/page.tsx`):**
   - Configurable alert threshold sliders (e.g., dynamically adjust the `threatScore >= 60` alert trigger).
   - Notification webhooks and log retention policies.
3. **WebSocket Live Alert Push:**
   - Implement NestJS Socket.IO Gateway (`@nestjs/websockets` and `socket.io` are already in `backend/package.json`).
   - Real-time notification badge pulse in the header and live alert toast notifications without page refresh.
4. **Production Hardening & Supervised ML Classifier:**
   - Execute the supervised multi-class attack classification roadmap detailed in `ML_AUDIT_AND_ARCHITECTURE_REPORT.md` (training XGBoost/Random Forest on CIC-IDS2017 / UNSW-NB15 to replace rule-based event mapping).

---

## 📊 Summary Progress & Milestone Breakdown

| Phase | Milestone Focus | Target % | Actual % | Current Status |
|---|---|---|---|---|
| **Phase 1** | Scaffolding, Docker, Polyglot DBs, JWT/RBAC, 10K Seeder, Base UI | 30% | 30% | ✅ Complete (100%) |
| **Phase 2** | FastAPI ML Ensemble, SHAP XAI, BullMQ Queue, Overview, Alerts, Logs | 40% | 40% | ✅ Complete (100%) |
| **Phase 3** | Geo Threat Map, Bulk Log Upload, Threats UI, Landing Page, Reports Engine | 20% | 19.5% | 🟢 ~98% Complete |
| **Phase 4** | Users UI, Settings UI, Socket.IO WebSockets, Supervised Classifier, Docker Prod | 10% | 0% | 🟡 Roadmap / Planned |
| **Overall** | **CyberShield AI Platform** | **100%** | **~90%** | **🟢 Strong Progress (v2.4)** |

---

## 🛠️ Key Technical Rules & Environment Constraints
1. **Prisma Version:** Strictly locked to **Prisma v6 (`^6.19.3`)** using `url = env("DATABASE_URL")`. Do not downgrade to Prisma v5 or alter the database connection string format.
2. **Decoupled Architecture:** Frontend (Next.js :3000) and Backend (NestJS :3001) communicate via REST API and Bearer JWT tokens.
3. **Dual Persistence Principle:**
   - Structured relational entities (`User`, `Alert`, `ThreatScore`, `BlockedIP`, `AuditLog`) $\rightarrow$ PostgreSQL.
   - Dynamic, high-volume raw security logs $\rightarrow$ MongoDB.
4. **Windows Port Conflict Resolution:** If local Windows `postgresql-x64-17` service is occupying port 5432, stop it (`Stop-Service postgresql-x64-17`) so Docker `cti-postgres` can bind to port 5432.
