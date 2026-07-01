<p align="center">
  <img src="https://img.shields.io/badge/CyberShield-AI-00bcd4?style=for-the-badge&logo=shield&logoColor=white" alt="CyberShield AI" />
</p>

<h1 align="center">🛡️ CyberShield AI — Cyber Threat Intelligence Platform</h1>

<p align="center">
  <strong>AI-Powered Real-Time Anomaly Detection and Attack Prediction for Enterprise Security Operations</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/scikit--learn-1.6-F7931E?style=flat-square&logo=scikit-learn" alt="scikit-learn" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 📋 Overview

### Problem Statement

Organizations generate massive volumes of security data daily — firewall logs, login attempts, IDS/IPS alerts, network traffic, and application logs. Manual analysis is **impossible at scale**: threats are missed, detection is delayed, and security teams are overwhelmed by alert fatigue.

### Solution

**CyberShield AI** is a cloud-ready, enterprise-grade cybersecurity platform that:

- **Collects** security logs from multiple sources into a centralized data lake
- **Analyzes** logs using Machine Learning (Isolation Forest + One-Class SVM ensemble)
- **Detects** anomalies in real-time with explainable AI (SHAP-based reasoning)
- **Predicts** potential attacks using historical pattern analysis
- **Visualizes** everything through a premium Security Operations Center (SOC) dashboard

### Target Audience

- **Security Operations Centers (SOCs)** — real-time monitoring and incident response
- **Cybersecurity Analysts** — threat investigation and forensics
- **IT Administrators** — infrastructure security monitoring
- **CISOs & Security Managers** — executive-level risk visibility and compliance reporting

---

## ✨ Features

### ✅ Completed Features

#### 🔐 Authentication & Access Control
- JWT-based authentication with access + refresh tokens
- Role-Based Access Control (RBAC) — Admin, Analyst, Viewer
- Secure password hashing (bcrypt, 12 rounds)
- Protected API routes with guard-based authorization

#### 📊 SOC Dashboard
- Real-time statistics (total logs, active alerts, critical threats, blocked IPs)
- Threat trend analysis (30-day area chart)
- Severity distribution (donut chart)
- Attack frequency analysis (stacked bar chart)
- Top threat sources (horizontal bar chart)
- Recent activity feed with live updates

#### 📋 Security Log Management
- Ingest individual or bulk security logs (REST API)
- Advanced search with 10+ filter dimensions (severity, source, IP, country, date range)
- Sortable & paginated log viewer (configurable page sizes)
- Detailed log inspection drawer with raw JSON data

#### 🚨 Alert Management
- AI-generated alerts triggered when threat score ≥ 60
- Alert lifecycle management (New → Investigating → Resolved / False Positive)
- Severity-coded alert cards with AI explanation (SHAP-based reasons)
- Alert statistics and distribution analytics
- Analyst assignment workflow

#### 🧠 AI/ML Intelligence Engine
- **Anomaly Detection** — Isolation Forest + One-Class SVM ensemble model
- **Threat Scoring** — Weighted 0-100 scoring (anomaly × 35% + login × 20% + geo × 15% + port × 15% + severity × 15%)
- **SHAP Explainability** — Human-readable explanations for every threat score
- **Auto-Training** — Models auto-train on synthetic baseline data on first startup
- **8-Feature Extraction** — Hour, login failure, protocol risk, source weight, country risk, severity level, port risk, action type

#### 🎯 Threat Analysis
- Entity-level threat tracking (IP addresses and user accounts)
- Factor breakdown visualization (5 risk factors as progress bars)
- Score history timeline charts
- Category classification (SAFE → CRITICAL)
- Expandable detail cards with AI analysis summary

#### ⚙️ Background Processing
- BullMQ job queue for asynchronous log processing
- Redis-backed queue with automatic retry logic
- Resilient ML service integration (graceful fallback on failure)
- Auto-alert and threat score creation from processed logs

#### 🐳 Containerized Infrastructure
- Docker Compose orchestration (PostgreSQL, MongoDB, Redis, Mongo Express, ML Service)
- Persistent data volumes
- Health checks for all services
- Single-command deployment

#### 📦 Data Seeding
- 10,000 realistic mock security logs with attack patterns
- 150 pre-generated alerts across all severity levels
- 50 threat scores for IP/user entities
- 10 blocked IPs from malicious sources
- 3 demo user accounts (Admin, Analyst, Viewer)

### 🚧 Planned Features (Phase 3)

- 🔮 Attack prediction with probability gauges and countermeasures
- 🌍 Geographical attack map with global threat visualization
- 📄 Report generation (PDF, CSV, Excel) with executive summaries
- 🔔 In-app notification system with read/unread tracking

### 📋 Future Features (Phase 4)

- ⚡ Real-time WebSocket monitoring (Socket.IO)
- 👥 User management console (Admin panel)
- ⚙️ Platform settings and preferences
- 📧 Email notification integration (Nodemailer)

---

## 🏗️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16 | React framework with App Router |
| **Frontend** | TypeScript | 5.x | Type-safe development |
| **Frontend** | Recharts | 3.8 | Data visualization (charts) |
| **Frontend** | Zustand | 5.x | State management |
| **Frontend** | Tailwind CSS | 4.x | Utility-first styling |
| **Frontend** | Lucide React | 1.21 | Icon library |
| **Backend** | NestJS | 11 | Enterprise Node.js framework |
| **Backend** | Prisma | 6.19.3 | PostgreSQL ORM |
| **Backend** | Mongoose | 9.7 | MongoDB ODM |
| **Backend** | Passport.js | 0.7 | Authentication strategies |
| **Backend** | BullMQ | 5.79 | Redis-backed job queue |
| **ML Service** | FastAPI | 0.115.6 | Python ML API framework |
| **ML Service** | scikit-learn | 1.6.1 | Machine learning models |
| **ML Service** | SHAP | 0.46.0 | Model explainability |
| **ML Service** | NumPy / Pandas | 2.2 / 2.2 | Data processing |
| **Database** | PostgreSQL | 16 | Relational data (users, alerts) |
| **Database** | MongoDB | 7 | Document store (raw security logs) |
| **Cache/Queue** | Redis | 7 | Caching + BullMQ job queue |
| **DevOps** | Docker Compose | — | Container orchestration |
| **Auth** | JWT | — | Access + refresh token auth |

---

## 📁 Project Structure

```
cyber-threat-intel/
│
├── 📄 docker-compose.yml          # Docker orchestration (5 services)
├── 📄 .env                        # Environment configuration
├── 📄 package.json                # Monorepo convenience scripts
├── 📄 README.md                   # This file
│
├── 🔧 backend/                    # NestJS 11 API Server (Port 3001)
│   ├── prisma/
│   │   ├── schema.prisma          # 7 PostgreSQL models with enums & indexes
│   │   └── seed.ts                # Database seeder (10K logs + alerts + users)
│   └── src/
│       ├── main.ts                # Bootstrap (CORS, validation, port 3001)
│       ├── app.module.ts          # Root module configuration
│       ├── auth/                  # 🔐 JWT authentication + Passport strategies
│       │   ├── auth.controller.ts # Register, Login, Refresh, Logout, Me
│       │   ├── auth.service.ts    # Token generation, password hashing
│       │   ├── dto/               # Validation DTOs (register, login, refresh)
│       │   └── strategies/        # JWT + Local Passport strategies
│       ├── users/                 # 👥 User CRUD (Admin-only management)
│       ├── logs/                  # 📋 Security log ingestion & querying
│       │   ├── logs.controller.ts # REST endpoints with filtering
│       │   ├── logs.service.ts    # MongoDB operations + BullMQ dispatch
│       │   ├── schemas/           # Mongoose schema (SecurityLog)
│       │   └── dto/               # Query & create validation DTOs
│       ├── alerts/                # 🚨 Alert management & statistics
│       ├── dashboard/             # 📊 Aggregated analytics endpoints
│       ├── jobs/                  # ⚙️ BullMQ background processors
│       │   ├── jobs.module.ts     # Queue registration
│       │   └── logs.processor.ts  # ML service integration worker
│       ├── prisma/                # 🗃️ PrismaClient lifecycle wrapper
│       └── common/                # 🛠️ Shared guards, decorators, filters
│           ├── guards/            # JWT auth guard, roles guard
│           ├── decorators/        # @Roles(), @CurrentUser()
│           ├── filters/           # Global exception filter
│           └── interceptors/      # Response transform interceptor
│
├── 🎨 frontend/                   # Next.js 16 SOC Dashboard (Port 3000)
│   └── src/
│       ├── app/
│       │   ├── (auth)/            # Authentication pages
│       │   │   ├── login/         # Glassmorphism login with animated background
│       │   │   └── register/      # Registration with password strength meter
│       │   └── (dashboard)/       # Protected dashboard pages
│       │       ├── overview/      # 📊 Main SOC dashboard (6 stats + 4 charts)
│       │       ├── logs/          # 📋 Log viewer (table + filters + drawer)
│       │       ├── alerts/        # 🚨 Alert cards with AI explanations
│       │       ├── threats/       # 🎯 Threat entity analysis (factor breakdown)
│       │       ├── predictions/   # 🔮 Attack predictions (Phase 3)
│       │       ├── geo-map/       # 🌍 Geographical map (Phase 3)
│       │       ├── reports/       # 📄 Report management (Phase 3)
│       │       ├── users/         # 👥 User management (Phase 4)
│       │       └── settings/      # ⚙️ Platform settings (Phase 4)
│       ├── components/
│       │   ├── layout/            # Sidebar navigation + header
│       │   ├── dashboard/         # Stat cards + activity feed
│       │   ├── charts/            # Threat trend, severity, attack frequency
│       │   └── logs/              # Log table, filters, detail drawer
│       ├── lib/                   # API client, formatters, mock data
│       ├── stores/                # Zustand auth store
│       └── types/                 # TypeScript interfaces
│
├── 🧠 ml-service/                 # FastAPI ML Service (Port 8000)
│   ├── Dockerfile                 # Python 3.11-slim container
│   ├── requirements.txt           # Python dependencies
│   └── app/
│       ├── main.py                # FastAPI app (3 endpoints + auto-training)
│       ├── config.py              # Settings (MODEL_DIR, CONTAMINATION, etc.)
│       ├── schemas/models.py      # Pydantic request/response models
│       ├── services/
│       │   ├── anomaly_detector.py  # Isolation Forest + One-Class SVM ensemble
│       │   ├── threat_scorer.py     # Weighted 0-100 threat scoring
│       │   └── explainer.py         # SHAP TreeExplainer + heuristic fallback
│       └── utils/
│           └── preprocessing.py     # 8-feature extraction + synthetic data
│
├── 📁 docs/                       # Documentation
└── 📁 scripts/                    # Utility scripts
```

---

## 🚀 Installation

### Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| **Node.js** | 18.x or later |
| **Python** | 3.10 or later |
| **Docker Desktop** | Latest |
| **npm** | 9.x or later |
| **pip** | 22.x or later |

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/cybershield-ai.git
cd cybershield-ai
```

### Step 2 — Configure Environment Variables

The `.env` file is pre-configured for local development. Review and update if needed:

```bash
# The .env file at the project root contains all configuration
# See the "Environment Variables" section below for details
cat .env
```

### Step 3 — Start Docker Services

```bash
# Start all infrastructure services
docker compose up -d

# Verify all containers are running
docker compose ps
```

### Step 4 — Set Up the Backend

```bash
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with 10,000 security logs + demo data
npx ts-node prisma/seed.ts

# Start the development server
npm run start:dev
```

The backend API will be available at **http://localhost:3001/api**

### Step 5 — Set Up the ML Service

```bash
cd ml-service
pip install -r requirements.txt

# Start the ML service (auto-trains on first run)
uvicorn app.main:app --reload --port 8000
```

The ML service will be available at **http://localhost:8000** with Swagger docs at **http://localhost:8000/docs**

### Step 6 — Set Up the Frontend

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

The dashboard will be available at **http://localhost:3000**

### Quick Start (All Services)

```bash
# Terminal 1 — Infrastructure
docker compose up -d

# Terminal 2 — Backend
cd backend && npm install && npx prisma generate && npx prisma migrate dev --name init && npx ts-node prisma/seed.ts && npm run start:dev

# Terminal 3 — ML Service
cd ml-service && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# Terminal 4 — Frontend
cd frontend && npm install && npm run dev
```

---

## 🔑 Environment Variables

All environment variables are stored in the root `.env` file:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NODE_ENV` | Application environment | `development` |
| `APP_NAME` | Application identifier | `CyberThreatIntel` |
| `APP_PORT` | Backend server port | `3001` |
| **PostgreSQL** | | |
| `POSTGRES_USER` | Database username | `cti_admin` |
| `POSTGRES_PASSWORD` | Database password | `cti_secret_2024` |
| `POSTGRES_DB` | Database name | `cyber_threat_intel` |
| `POSTGRES_HOST` | Database host | `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `DATABASE_URL` | Prisma connection string | `postgresql://cti_admin:...@localhost:5432/cyber_threat_intel` |
| **MongoDB** | | |
| `MONGO_USER` | MongoDB username | `cti_admin` |
| `MONGO_PASSWORD` | MongoDB password | `cti_mongo_2024` |
| `MONGO_DB` | MongoDB database name | `cti_logs` |
| `MONGODB_URI` | Mongoose connection string | `mongodb://cti_admin:...@localhost:27017/cti_logs` |
| **Redis** | | |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | `cti_redis_2024` |
| **JWT** | | |
| `JWT_SECRET` | Access token signing secret | *(change in production)* |
| `JWT_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | *(change in production)* |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| **Frontend** | | |
| `NEXT_PUBLIC_API_URL` | Backend API URL (client-side) | `http://localhost:3001/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `http://localhost:3001` |
| **ML Service** | | |
| `ML_SERVICE_URL` | ML service URL (backend → ML) | `http://localhost:8000` |

> ⚠️ **Production Warning**: Change all default passwords and JWT secrets before deploying to production.

---

## 💻 Usage

### Demo Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@cti.com` | `Admin@123` | Full access — manage users, alerts, reports |
| **Analyst** | `analyst@cti.com` | `Analyst@123` | View & investigate alerts, manage logs |
| **Viewer** | `viewer@cti.com` | `Viewer@123` | Read-only dashboard access |

### Example Workflows

#### 1. Monitor the SOC Dashboard
1. Login with `admin@cti.com` / `Admin@123`
2. Navigate to **Overview** — see real-time stats, threat trends, severity distribution
3. Check **Alerts** for any critical or high-severity alerts
4. Click an alert to see AI-generated explanations (SHAP reasons)

#### 2. Investigate Security Logs
1. Navigate to **Security Logs**
2. Filter by severity: `CRITICAL`, source: `IDS`, date range
3. Click a log entry to open the detail drawer
4. Review raw data, threat score, and source information

#### 3. Analyze Threat Entities
1. Navigate to **Threat Analysis**
2. Filter by category: `CRITICAL` or `HIGH_RISK`
3. Expand an entity card to see factor breakdowns and score history
4. Review AI analysis and related alerts

#### 4. Ingest New Logs via API
```bash
curl -X POST http://localhost:3001/api/logs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceIp": "185.220.101.34",
    "destinationIp": "10.0.0.5",
    "sourcePort": 4444,
    "destinationPort": 22,
    "protocol": "SSH",
    "action": "DENY",
    "severity": "HIGH",
    "source": "FIREWALL",
    "eventType": "LOGIN_FAILURE",
    "message": "Failed SSH login attempt from Russia",
    "country": "Russia",
    "timestamp": "2026-07-01T12:00:00Z"
  }'
```

The log will be automatically processed by the ML service, scored, and may trigger an alert if the threat score ≥ 60.

---

## 📡 API Documentation

All API routes are prefixed with `/api` and return responses in the format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-07-01T12:00:00.000Z"
}
```

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | `{ email, password, firstName, lastName }` | Register new user |
| `POST` | `/api/auth/login` | `{ email, password }` | Login, returns JWT tokens |
| `POST` | `/api/auth/refresh` | `{ refreshToken }` | Refresh access token |
| `POST` | `/api/auth/logout` | — | Logout |
| `GET` | `/api/auth/me` | — | Get current user profile |

#### Login Response Example

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@cti.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Security Logs 🔒

> All log endpoints require JWT authentication via `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/logs` | Query logs with filters |
| `GET` | `/api/logs/:id` | Get log by ID |
| `GET` | `/api/logs/stats` | Aggregated log statistics |
| `POST` | `/api/logs` | Ingest single log |
| `POST` | `/api/logs/bulk` | Ingest batch of logs |

**Query Parameters for GET /api/logs:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `severity` | string | Filter: LOW, MEDIUM, HIGH, CRITICAL |
| `source` | string | Filter: FIREWALL, IDS, ANTIVIRUS, etc. |
| `sourceIp` | string | Filter by source IP address |
| `country` | string | Filter by country |
| `startDate` | string | ISO date — filter from |
| `endDate` | string | ISO date — filter to |
| `search` | string | Full-text search |
| `sortBy` | string | Sort field (timestamp, severity, etc.) |
| `sortOrder` | string | `asc` or `desc` |

### Alerts 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/alerts` | Query alerts with filters |
| `GET` | `/api/alerts/:id` | Get alert by ID |
| `GET` | `/api/alerts/stats` | Alert statistics |
| `PATCH` | `/api/alerts/:id` | Update status / assign analyst |

### Dashboard 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Overview statistics |
| `GET` | `/api/dashboard/threat-trends` | 30-day threat trend data |
| `GET` | `/api/dashboard/attack-frequency` | Attack type frequency |
| `GET` | `/api/dashboard/severity-distribution` | Severity breakdown |
| `GET` | `/api/dashboard/recent-activity` | Latest logs and alerts |
| `GET` | `/api/dashboard/top-sources` | Top threat source IPs |

### Users 🔒 (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get user by ID |
| `PATCH` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Deactivate user |

### ML Service (Direct Access)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `localhost:8000/health` | Health check + model info |
| `POST` | `localhost:8000/api/v1/detect` | Batch anomaly detection |
| `POST` | `localhost:8000/api/v1/train` | Train/retrain ML models |

---

## 📸 Screenshots

> Replace these placeholders with actual screenshots of your running application.

### Login Page
<!-- ![Login Page](docs/screenshots/login.png) -->
*Glassmorphism login with animated grid background and demo credentials*

### SOC Dashboard
<!-- ![SOC Dashboard](docs/screenshots/dashboard.png) -->
*Real-time overview with 6 stat cards, threat trends, severity distribution, and activity feed*

### Security Logs
<!-- ![Security Logs](docs/screenshots/logs.png) -->
*Searchable log viewer with advanced filtering, sorting, and detail drawer*

### Alerts
<!-- ![Alerts](docs/screenshots/alerts.png) -->
*AI-generated alerts with SHAP-based explanations and severity coding*

### Threat Analysis
<!-- ![Threat Analysis](docs/screenshots/threats.png) -->
*Entity-level threat cards with factor breakdowns, score history, and AI analysis*

---

## 🚢 Deployment

### Docker Compose (Recommended)

The entire stack can be deployed with Docker Compose:

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Services Overview

| Service | Port | Container Name | Purpose |
|---------|------|---------------|---------|
| PostgreSQL | 5432 | `cti-postgres` | Relational data (users, alerts, scores) |
| MongoDB | 27017 | `cti-mongodb` | Raw security log storage |
| Redis | 6379 | `cti-redis` | Job queue + caching |
| Mongo Express | 8081 | `cti-mongo-express` | MongoDB admin UI |
| ML Service | 8000 | `cti-ml-service` | Anomaly detection + scoring |

### Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate strong JWT secrets (`openssl rand -hex 64`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL/TLS certificates
- [ ] Set up reverse proxy (Nginx / Caddy)
- [ ] Enable database backups (pg_dump + mongodump)
- [ ] Configure log rotation
- [ ] Set up monitoring (Prometheus / Grafana)
- [ ] Configure rate limiting
- [ ] Restrict CORS to production domains only
- [ ] Set up container restart policies
- [ ] Enable firewall rules for service ports

---

## 🗺️ Roadmap

### Phase 1 — Foundation ✅ *Completed*
- [x] Monorepo scaffolding (NestJS + Next.js)
- [x] Docker Compose infrastructure (PostgreSQL, MongoDB, Redis)
- [x] PostgreSQL schema (7 models) + MongoDB schema
- [x] JWT authentication with RBAC (Admin, Analyst, Viewer)
- [x] Security log ingestion and querying
- [x] Alert management system
- [x] SOC dashboard with 6 stat cards and 4 chart types
- [x] Log viewer with advanced filtering
- [x] Database seeding (10,000 realistic logs)

### Phase 2 — Intelligence Engine ✅ *Completed*
- [x] FastAPI ML microservice with anomaly detection
- [x] Isolation Forest + One-Class SVM ensemble
- [x] SHAP-based explainable AI
- [x] Weighted threat scoring (0-100)
- [x] BullMQ background log processing
- [x] Automatic alert generation from ML scores
- [x] Threat analysis page with entity cards
- [x] Factor breakdown visualization

### Phase 3 — Operations 🚧 *In Progress*
- [ ] Attack prediction with ML-based pattern analysis
- [ ] Geographical attack map (global threat visualization)
- [ ] Report generation (PDF, CSV, Excel)
- [ ] In-app notification system

### Phase 4 — Enterprise Features 📋 *Planned*
- [ ] Real-time WebSocket monitoring (Socket.IO)
- [ ] User management admin console
- [ ] Platform settings and preferences
- [ ] Email notification integration (Nodemailer)
- [ ] Scheduled report generation (cron jobs)
- [ ] API rate limiting and throttling
- [ ] Audit trail dashboard
- [ ] Multi-tenant support

---

## 🤝 Contribution Guidelines

We welcome contributions! Here's how you can help:

### Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
5. **Push** to the branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write TypeScript (no plain JavaScript)
- All backend imports must use `.js` extensions (ESM)
- Add proper JSDoc comments to new functions and classes
- Ensure `npx tsc --noEmit` passes with zero errors (backend)
- Ensure `npx next build` compiles all routes (frontend)
- Keep Prisma at v6.x — do not upgrade to v7

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add or update tests
chore: maintenance tasks
```

### Reporting Issues

- Use GitHub Issues to report bugs
- Include steps to reproduce, expected behavior, and actual behavior
- Attach relevant logs or screenshots

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Yash Raj

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📧 Contact

**Yash Raj** — Project Author

- 🐙 GitHub: [github.com/YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- 💼 LinkedIn: [linkedin.com/in/YOUR_PROFILE](https://linkedin.com/in/YOUR_PROFILE)
- 📧 Email: your.email@example.com

---

<p align="center">
  <strong>Built with 🛡️ by Yash Raj</strong>
</p>

<p align="center">
  <sub>If you found this project useful, please ⭐ star the repository!</sub>
</p>
