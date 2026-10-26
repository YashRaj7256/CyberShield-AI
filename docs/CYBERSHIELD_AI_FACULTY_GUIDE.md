# 🛡️ CYBERSHIELD AI — Comprehensive System Audit & Faculty Defense Guide

> **Document Classification:** Master Project Audit & Oral Examination Defense Guide  
> **Project Name:** CyberShield AI — AI-Powered Cyber Threat Intelligence Platform  
> **Repository:** `YashRaj7256/CyberShield-AI`  
> **Audit Type:** Strict Read-Only Codebase Inspection & Verification  
> **Audit Date:** September 2026  
> **Architecture:** 3-Tier Polyglot Microservices (Next.js 16 + NestJS 11 + FastAPI + Docker)  

---

## 📑 Table of Contents

1. [Executive Summary & System Architecture Overview](#1-executive-summary--system-architecture-overview)
2. [Database Architecture & Polyglot Persistence](#2-database-architecture--polyglot-persistence)
3. [Authentication, Authorization & RBAC](#3-authentication-authorization--rbac)
4. [Deep-Dive Audit of Every Page & Route](#4-deep-dive-audit-of-every-page--route)
   - 4.1 [Landing Page (`/`)](#41-landing-page-)
   - 4.2 [Authentication (`/login`, `/register`)](#42-authentication-login-register)
   - 4.3 [Overview Dashboard (`/overview`)](#43-overview-dashboard-overview)
   - 4.4 [Security Logs Explorer (`/logs`)](#44-security-logs-explorer-logs)
   - 4.5 [Incident Alerts Management (`/alerts`)](#45-incident-alerts-management-alerts)
   - 4.6 [Threat Entity Analysis (`/threats`)](#46-threat-entity-analysis-threats)
   - 4.7 [AI Attack Predictions & Forecasting (`/predictions`)](#47-ai-attack-predictions--forecasting-predictions)
   - 4.8 [Geographical Attack Map (`/geo-map`)](#48-geographical-attack-map-geo-map)
   - 4.9 [Automated Security Reports (`/reports`)](#49-automated-security-reports-reports)
   - 4.10 [User Management (`/users`)](#410-user-management-users)
   - 4.11 [System Settings (`/settings`)](#411-system-settings-settings)
5. [Interactive Controls, Buttons & Action Trace Audit](#5-interactive-controls-buttons--action-trace-audit)
6. [Machine Learning & Artificial Intelligence: The Ground Truth](#6-machine-learning--artificial-intelligence-the-ground-truth)
   - 6.1 [Summary Taxonomy](#61-summary-taxonomy)
   - 6.2 [Model 1: Isolation Forest (Genuine Unsupervised ML)](#62-model-1-isolation-forest-genuine-unsupervised-ml)
   - 6.3 [Model 2: One-Class Support Vector Machine (Genuine ML)](#63-model-2-one-class-support-vector-machine-genuine-ml)
   - 6.4 [Feature Extraction & Standardization](#64-feature-extraction--standardization)
   - 6.5 [Explainable AI (SHAP TreeExplainer & Heuristic Fallback)](#65-explainable-ai-shap-treeexplainer--heuristic-fallback)
   - 6.6 [Composite Threat Scorer (Rule-Based Weighted Formula)](#66-composite-threat-scorer-rule-based-weighted-formula)
   - 6.7 [Attack Predictor / Forecaster (Expert Heuristic Engine)](#67-attack-predictor--forecaster-expert-heuristic-engine)
   - 6.8 [Attack Type Classification (Dictionary Mapping / Ground Truth)](#68-attack-type-classification-dictionary-mapping--ground-truth)
7. [Enterprise Workflow: End-to-End Data Pipeline](#7-enterprise-workflow-end-to-end-data-pipeline)
8. [Log Ingestion & Log Normalization Investigation](#8-log-ingestion--log-normalization-investigation)
   - 8.1 [Where the Normalizer Resides](#81-where-the-normalizer-resides)
   - 8.2 [Supported Input Formats & Channels](#82-supported-input-formats--channels)
   - 8.3 [Field Mappings & Transformations](#83-field-mappings--transformations)
   - 8.4 [Data Destination](#84-data-destination)
   - 8.5 [Connection to Ingestion Pipeline](#85-connection-to-ingestion-pipeline)
   - 8.6 [Roadmap for Production Enterprise Ingestion](#86-roadmap-for-production-enterprise-ingestion)
9. [Backend Controllers & REST API Catalog](#9-backend-controllers--rest-api-catalog)
10. [Infrastructure, Docker & Service Orchestration](#10-infrastructure-docker--service-orchestration)
11. [Implementation Truth Table](#11-implementation-truth-table)
12. [Faculty Q&A Preparation: Short, Easy Verbal Answers](#12-faculty-qa-preparation-short-easy-verbal-answers)
13. [10-Minute Faculty Demo Script](#13-10-minute-faculty-demo-script)
14. [Crucial Defense Warnings: Claims You Must NOT Make](#14-crucial-defense-warnings-claims-you-must-not-make)

---

## 1. Executive Summary & System Architecture Overview

CyberShield AI is an enterprise-oriented Cyber Threat Intelligence (CTI) and Security Operations Center (SOC) management platform. It combines real-time security log ingestion, unsupervised machine learning anomaly detection, automated threat scoring, spatial telemetry visualization, proactive attack forecasting, and executive PDF reporting.

```
                              ┌────────────────────────────────────────┐
                              │           CLIENT TIER                  │
                              │ Next.js 16 (React 19, Tailwind v4)    │
                              │ Port: 3000 (Zustand Auth Store)        │
                              └──────────────────┬─────────────────────┘
                                                 │ HTTP REST / JWT
                                                 ▼
                              ┌────────────────────────────────────────┐
                              │          APPLICATION TIER              │
                              │ NestJS 11 REST API Gateway & Engine    │
                              │ Port: 3001 (Passport, Guards, DTOs)    │
                              └───┬───────────────────┬────────────────┘
                                  │                   │
         Async BullMQ Job ({logId})│                   │ Mongoose & Prisma
                                  ▼                   │
        ┌───────────────────────────┐                 │
        │       QUEUE BROKER        │                 │
        │ Redis 7 Alpine (Port 6379)│                 │
        └─────────────┬─────────────┘                 │
                      │ Worker consumes               │
                      ▼                               ▼
        ┌───────────────────────────┐   ┌──────────────────────────────┐
        │     ANALYTICS WORKER      │   │       POLYGLOT STORAGE       │
        │ backend/src/jobs/         │   │ 1. PostgreSQL 16 (Port 5432) │
        │ logs.processor.ts         │   │    ACID: Alerts, Users,      │
        └─────────────┬─────────────┘   │    Reports, ThreatScores     │
                      │ POST /detect    │ 2. MongoDB 7 (Port 27017)    │
                      ▼                 │    Document Lake: Raw Logs   │
        ┌───────────────────────────┐   └──────────────────────────────┘
        │      AI / ML ENGINE       │
        │ FastAPI (Python 3.11)     │
        │ Port: 8000                │
        │ Isolation Forest + OCSVM  │
        └───────────────────────────┘
```

### The Three Tiers Explained Simply:
1. **Frontend Presentation Tier (`/frontend`):** Built with Next.js 16, React 19, and Tailwind CSS 4. Uses a dark glassmorphic cybersecurity theme. Displays real-time charts (Recharts), an interactive Leaflet map, telemetry tables, forecasting cards, and report management drawers.
2. **Backend Orchestration Tier (`/backend`):** Built with NestJS 11 and TypeScript. Acts as the central traffic controller: handles authentication (JWT + bcrypt), enforces Role-Based Access Control (`ADMIN`, `ANALYST`, `VIEWER`), coordinates database persistence, and runs BullMQ background workers.
3. **Machine Learning Intelligence Tier (`/ml-service`):** Built with Python 3.11 and FastAPI. Implements an unsupervised anomaly detection ensemble (Scikit-Learn Isolation Forest and One-Class SVM), SHAP explainability, weighted threat scoring, and heuristic attack forecasting.

---

## 2. Database Architecture & Polyglot Persistence

CyberShield AI uses **Polyglot Persistence** — meaning it uses two different database engines, each suited for a specific workload:

```
                  ┌────────────────────────────────────────────┐
                  │            POLYGLOT PERSISTENCE            │
                  └──────────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
    ┌─────────────────────────┐                     ┌─────────────────────────┐
    │       POSTGRESQL        │                     │         MONGODB         │
    │   Structured / ACID     │                     │     Unstructured Lake   │
    │   Prisma ORM v6         │                     │     Mongoose ODM v9     │
    └────────────┬────────────┘                     └────────────┬────────────┘
                 │                                               │
       • Users & Roles                                 • High-velocity Logs
       • Triage Alerts & Status                        • Network Telemetry
       • Blocked IP Enforcements                       • Polymorphic rawData
       • Generated Reports & Paths                     • Geo Coordinates
       • Audit Trails & Settings                       • ML Inference Metadata
```

### Why MongoDB for Security Logs?
* Security logs arrive in varying schemas from firewalls, servers, Windows endpoints, and antivirus agents.
* Some logs contain IP ports and MAC addresses; others contain process execution trees or HTTP query strings.
* MongoDB’s document store allows polymorphic storage without requiring database migrations every time a new device type is added.
* Indexed fields: `timestamp`, `sourceIp`, `severity`, `isProcessed`, `eventType`, `source`.

### Why PostgreSQL for System State?
* Security triage requires strict transactional consistency (ACID guarantees).
* An alert cannot point to a deleted user; an audit trail must be immutable.
* Managed via **Prisma ORM v6**.
* 7 relational tables: `users`, `alerts`, `threat_scores`, `blocked_ips`, `audit_logs`, `reports`, `notification_settings`.

---

## 3. Authentication, Authorization & RBAC

* **Authentication Architecture:** Dual-token JWT lifecycle.
  * Access Token: 15-minute expiration (signed with `JWT_SECRET`).
  * Refresh Token: 7-day expiration (signed with `JWT_REFRESH_SECRET`).
* **Password Security:** Salted and hashed using `bcrypt` with 12 salt rounds (`auth.service.ts`).
* **Route Protection:** Handled via NestJS guards:
  * `JwtAuthGuard`: Validates the `Authorization: Bearer <token>` header.
  * `RolesGuard`: Enforces role checks against the `@Roles(...)` metadata decorator.
* **Role Hierarchy:**
  1. `ADMIN`: Full read/write access. User management, configuration, alert status changes, report generation, manual log ingestion.
  2. `ANALYST`: Incident investigation, alert triage (Resolve, False Positive), running predictions, generating reports, ingesting logs.
  3. `VIEWER`: Read-only access to dashboards, logs, alerts, maps, and reports. Cannot alter incident state or trigger configuration changes.
* **Client-Side Auth State:** Managed with **Zustand** (`useAuthStore`). Tokens and user profiles are synchronized to browser `localStorage`. A global Axios interceptor (`lib/api.ts`) automatically attaches Bearer tokens to all outbound HTTP requests.

---

## 4. Deep-Dive Audit of Every Page & Route

---

### 4.1 Landing Page (`/`)

* **Page Name:** CyberShield AI Public Showcase & Landing Page
* **Route:** `/`
* **Source File:** `frontend/src/app/page.tsx`
* **What the Page Is For:** Public product overview, architecture explainer, and entry point to the SOC command console.
* **Who Would Use It in an Enterprise:** Executive leadership (CISO, CIO), prospective clients, security architects reviewing system capabilities.
* **What Information It Displays:**
  * Animated hero section with telemetry pulse counters.
  * Platform pillars: Real-Time Ingestion, AI Anomaly Detection, Threat Scoring (0–100), Security Alerting.
  * Interactive system architecture diagram visualizer (`CyberArchitectureVisual`) demonstrating data flow between Next.js, NestJS, Redis, MongoDB, PostgreSQL, and FastAPI.
  * Recent threat sample cards with severity styling.
* **Where the Data Comes From:** Static component constants (`NAV_LINKS`, `FEATURES`, `ALERTS`) designed for marketing and architecture presentation.
* **Backend Service / Database / AI:** None directly connected. Static marketing presentation.
* **Why the Feature Exists:** Gives external stakeholders and evaluators immediate visibility into system architecture and capabilities before logging into the restricted console.

---

### 4.2 Authentication (`/login`, `/register`)

* **Page Name:** SOC Identity & Access Portal
* **Route:** `/login`, `/register`
* **Source Files:**
  * `frontend/src/app/(auth)/login/page.tsx`
  * `frontend/src/app/(auth)/register/page.tsx`
* **What the Page Is For:** Authenticating authorized security analysts and registering new user accounts.
* **Who Would Use It in an Enterprise:** All SOC personnel (Tier 1 Analysts, Lead Engineers, Incident Responders, Administrators).
* **What Information It Displays:**
  * Dual-mode sliding panel for Sign In and Sign Up.
  * Email and password inputs with password visibility toggle.
  * Password strength evaluator (length, uppercase, lowercase, numbers, special characters).
  * System security status badges ("256-bit AES", "SOC 2 Type II").
* **Where the Data Comes From:** User form input submitted to the NestJS API.
* **Which API / Backend Service It Uses:**
  * `POST /api/auth/login` (consumes `LoginDto`)
  * `POST /api/auth/register` (consumes `RegisterDto`)
  * Implemented in `backend/src/auth/auth.controller.ts` and `auth.service.ts`.
* **Which Database Is Involved:** PostgreSQL (`users` table via Prisma).
* **Whether AI/ML Is Involved:** No.
* **Why the Feature Exists:** Protects internal threat intelligence, customer telemetry, and infrastructure controls behind strict enterprise authentication.

---

### 4.3 Overview Dashboard (`/overview`)

* **Page Name:** Security Operations Center (SOC) Command Overview
* **Route:** `/overview`
* **Source File:** `frontend/src/app/(dashboard)/overview/page.tsx`
* **What the Page Is For:** Primary operational HUD (Heads-Up Display) for real-time situational awareness across the entire enterprise estate.
* **Who Would Use It in an Enterprise:** SOC Operations Manager, Lead Triage Analyst, CISO during daily briefings.
* **What Information It Displays:**
  * **6 Metric StatCards:** Total Ingested Logs, Active Incidents, Critical Severity Alerts, High Risk Users, Blocked IPs, Average Threat Score.
  * **Threat Trend Chart (Area Chart):** 30-day temporal breakdown of threats, allowed traffic, and blocked events.
  * **Severity Distribution (Donut Chart):** Proportion of events categorized as Critical, High, Medium, and Low.
  * **Attack Frequency (Stacked Bar Chart):** Distribution of attack vectors (Brute Force, Malware, Phishing, DDoS, Other).
  * **Top Attacking Sources (Bar Chart):** Top offending external IP addresses and their country origins.
  * **Recent Activity Feed:** Chronological stream combining raw incoming logs and triggered security alerts.
  * **Mode Badge:** Live telemetry indicator (`LIVE TELEMETRY` vs `SANDBOX MODE`).
* **Where the Data Comes From:**
  * Primary: Live NestJS API endpoints aggregated from MongoDB and PostgreSQL.
  * Secondary / Fallback: `lib/telemetry-store.ts` (browser `localStorage` cache supporting a simulated 1.25M baseline scale if the backend is offline).
* **Which API / Backend Service It Uses:**
  * `GET /api/dashboard/stats`
  * `GET /api/dashboard/threat-trends`
  * `GET /api/dashboard/severity-distribution`
  * `GET /api/dashboard/attack-frequency`
  * `GET /api/dashboard/top-sources`
  * `GET /api/dashboard/recent-activity`
  * Implemented in `backend/src/dashboard/dashboard.service.ts`.
* **Which Database Is Involved:** Polyglot aggregation:
  * MongoDB: Aggregates counts and groupings over `security_logs`.
  * PostgreSQL: Counts `Alert`, `User`, `BlockedIP`, and `ThreatScore` tables.
* **Whether AI/ML Is Involved:** Indirectly. The threat scores, severity levels, and alert counts shown here are the results generated by the ML pipeline during log processing.
* **Why the Feature Exists:** Eliminates "alert fatigue" by converting millions of raw security events into actionable visual metrics and trends.

---

### 4.4 Security Logs Explorer (`/logs`)

* **Page Name:** Raw Security Telemetry Data Lake Explorer
* **Route:** `/logs`
* **Source File:** `frontend/src/app/(dashboard)/logs/page.tsx`
* **What the Page Is For:** Deep-dive forensic exploration, querying, and filtering of raw security events across all network assets.
* **Who Would Use It in an Enterprise:** Tier 2 / Tier 3 Incident Responders, Forensic Investigators, Compliance Auditors.
* **What Information It Displays:**
  * High-density log table: Timestamp, Source IP $\rightarrow$ Destination IP, Event Type & Message, Protocol, Firewall Action, Severity, Ingestion Source, Country/City.
  * Dynamic ML Anomaly & Threat Score badges for every individual log.
  * Slide-out `LogDetailDrawer`: Complete JSON payload view, network metadata, device info, browser/OS fingerprinting, and ML diagnostic reasons.
  * Search and filter controls: Debounced free-text search (IP, event, message), Severity dropdown, Source dropdown, Protocol dropdown, Action dropdown, Date range pickers.
  * Upload Modal: Dual-tab dialog for manual Single Log ingestion and Bulk JSON array importation.
* **Where the Data Comes From:**
  * Primary: MongoDB `security_logs` collection queried via `GET /api/logs`.
  * Ingestion: User form or pasted JSON sent to `POST /api/logs` or `POST /api/logs/bulk`.
* **Which API / Backend Service It Uses:**
  * `GET /api/logs`: Paginated multi-parameter search (`backend/src/logs/logs.service.ts`).
  * `GET /api/logs/stats`: Ingested telemetry distribution statistics.
  * `GET /api/logs/:id`: Single log retrieval by MongoDB ObjectId.
  * `POST /api/logs`: Ingest single log.
  * `POST /api/logs/bulk`: Ingest array of logs.
* **Which Database Is Involved:** MongoDB (`security_logs` collection).
* **Whether AI/ML Is Involved:** Yes. Once a log is saved, the BullMQ worker passes it to the FastAPI ML service, which writes back `anomalyScore`, `threatScore`, and `metadata.reasons`.
* **Why the Feature Exists:** Gives analysts immediate forensic visibility into low-level network packets, authentication attempts, and firewall drops without needing direct database access.

---

### 4.5 Incident Alerts Management (`/alerts`)

* **Page Name:** Security Operations Incident Management Console
* **Route:** `/alerts`
* **Source File:** `frontend/src/app/(dashboard)/alerts/page.tsx`
* **What the Page Is For:** Central triage hub for reviewing, investigating, and closing security alerts generated by the ML detection engine.
* **Who Would Use It in an Enterprise:** Tier 1 and Tier 2 SOC Analysts during their active shifts.
* **What Information It Displays:**
  * **Alert Telemetry Ribbon:** Real-time counters for Active Triage, Critical Incidents, High Alerts, Mean Time to Detect (MTTD), and Mean Time to Respond (MTTR).
  * **Severity Filter Tabs:** All, Critical ($S \ge 80$), High ($60 \le S < 80$), Medium ($40 \le S < 60$), Low ($S < 40$).
  * **Status Filter Tabs:** All, New Incidents, Under Investigation, Resolved, False Positives.
  * **Dual View Modes:** Structured Table View or Detailed Grid Cards.
  * **Alert Detail Drawer & Expandable Rows:** Displays source IP, destination asset, threat score gauge, and **Explainable AI (SHAP) diagnostic reasons** explaining why the ML model flagged the event.
  * **Triage Action Controls:** "Investigate", "Resolve", and "False Positive" buttons.
* **Where the Data Comes From:** PostgreSQL `alerts` table fetched via `GET /api/alerts`.
* **Which API / Backend Service It Uses:**
  * `GET /api/alerts`: Fetches filtered alerts list (`backend/src/alerts/alerts.service.ts`).
  * `GET /api/alerts/stats`: Aggregates active alert metrics.
  * `PATCH /api/alerts/:id`: Updates alert status (`NEW` $\rightarrow$ `INVESTIGATING` $\rightarrow$ `RESOLVED` / `FALSE_POSITIVE`).
  * *(Audit Note on Frontend Endpoint: See Section 5 for the `/status` route path finding).*
* **Which Database Is Involved:** PostgreSQL (`alerts` table via Prisma).
* **Whether AI/ML Is Involved:** Yes. Alerts are automatically instantiated by the background worker when a log's ML composite threat score reaches or exceeds 60 (`threatScore >= 60`).
* **Why the Feature Exists:** Provides an auditable lifecycle for containment and remediation of active cyber threats.

---

### 4.6 Threat Entity Analysis (`/threats`)

* **Page Name:** Threat Entity Intelligence & Behavioral Profiler
* **Route:** `/threats`
* **Source File:** `frontend/src/app/(dashboard)/threats/page.tsx`
* **What the Page Is For:** Profiling suspect entities (host IP addresses, user accounts, sessions) to understand sustained attack patterns over time.
* **Who Would Use It in an Enterprise:** Threat Intelligence Analysts, Senior Threat Hunters, Red/Blue Team Leads.
* **What Information It Displays:**
  * Entity intelligence cards and table view: Entity Value (IP / User), Risk Category (`CRITICAL`, `HIGH_RISK`, `MEDIUM_RISK`, `LOW_RISK`, `SAFE`), Country flag, Last Seen timestamp.
  * **5-Factor Threat Breakdown Gauges:**
    1. Anomaly Score (from Isolation Forest / OCSVM)
    2. Failed Logins Factor (credential brute force velocity)
    3. Country Risk Factor (geopolitical risk weighting)
    4. Port Risk Factor (vulnerable service targeted, e.g., SSH 22, RDP 3389)
    5. Severity Factor (event severity classification)
  * Historical Threat Trend Line: Recharts timeline visualizing the entity's risk trajectory over previous days.
  * Related incident alerts list associated with the specific entity.
* **Where the Data Comes From:**
  * Live backend endpoint: `GET /api/threats` (`backend/src/threats/threats.service.ts`).
  * Fallback: `mockThreatEntities` and `mockThreatSummary` (`lib/mock-data.ts`).
* **Which API / Backend Service It Uses:** `GET /api/threats` (supports pagination and category filtering).
* **Which Database Is Involved:** PostgreSQL (`threat_scores` and `alerts` tables via Prisma).
* **Whether AI/ML Is Involved:** Yes. The displayed threat scores and factor breakdowns are derived directly from the ML ensemble and feature weighting formulas.
* **Why the Feature Exists:** Individual logs can look benign in isolation; entity profiling identifies repeat offenders and distributed persistent attack campaigns.

---

### 4.7 AI Attack Predictions & Forecasting (`/predictions`)

* **Page Name:** Predictive Attack Intelligence & Proactive Defense Forecasting
* **Route:** `/predictions`
* **Source File:** `frontend/src/app/(dashboard)/predictions/page.tsx`
* **What the Page Is For:** Analyzing recent telemetry sliding windows to forecast impending multi-stage attack scenarios before data exfiltration or system compromise occurs.
* **Who Would Use It in an Enterprise:** CISO, SOC Lead, Incident Response Commanders seeking proactive rather than reactive defense.
* **What Information It Displays:**
  * **Analysis Window Controls:** Lookback window selector (6 Hours, 12 Hours, 24 Hours, 48 Hours, 7 Days).
  * **Mode Switcher:** Real Database Telemetry mode vs Simulation Presets (Brute Force Wave, Zero-Day Exploit, DDoS Buildup, Insider Exfiltration).
  * **Forecast Cards:** Probability rating (0–100%), Model Confidence score, Predicted Timeframe (e.g., "Within 2 to 6 hours"), Attack Vector title, Severity badge.
  * **Impending Threat Brief Panel:**
    * Impact narrative and attack sequence explanation.
    * Target assets and compromised user accounts.
    * Observable telemetry precursors (indicators of compromise).
    * **Actionable Countermeasures Checklist:** Interactive checklist of containment steps (e.g., "Block CIDR at edge firewall", "Force MFA reset", "Isolate subnet").
* **Where the Data Comes From:**
  * Live Pipeline: Queries MongoDB for the most recent 250 security logs $\rightarrow$ forwards them to the Python ML microservice `POST /api/v1/predict`.
  * Simulation Mode: Client-side predefined attack scenarios (`SIMULATION_PRESETS` in `components/predictions`).
* **Which API / Backend Service It Uses:**
  * Frontend calls NestJS: `POST /api/predictions` (`backend/src/predictions/predictions.controller.ts`).
  * NestJS forwards to FastAPI: `POST /api/v1/predict` (`ml-service/app/services/predictor.py`).
* **Which Database Is Involved:** MongoDB (reads recent `security_logs`).
* **Whether AI/ML Is Involved:** Yes — specifically an **Expert Statistical Heuristic Pattern Engine** (900+ lines in `predictor.py`). It calculates velocity, entropy, and temporal correlations over 8 attack scenarios.
* **Why the Feature Exists:** Moves the organization from reactive incident cleanup to proactive pre-emptive defense.

---

### 4.8 Geographical Attack Map (`/geo-map`)

* **Page Name:** Geospatial Threat Intelligence & Attack Vector Visualizer
* **Route:** `/geo-map`
* **Source File:** `frontend/src/app/(dashboard)/geo-map/page.tsx`
* **What the Page Is For:** Visualizing global cyber attack origins in real-time, identifying hostile geographic regions, and mapping attack paths targeting enterprise assets.
* **Who Would Use It in an Enterprise:** SOC Wall Display, Threat Analysts monitoring nation-state actors, Security Executives presenting to boards.
* **What Information It Displays:**
  * **Interactive Dark World Map (Leaflet.js):** Custom dark tile layer plotting global coordinates.
  * **Pulsing Origin Pins:** Color-coded markers based on severity (Critical = Red, High = Orange, Medium = Yellow, Low = Green).
  * **Dynamic Ballistic Arcs:** Animated visual flight paths connecting global attacker coordinates to the defended corporate datacenter.
  * **Metric Ribbon:** Total Global Vectors, Active Nations, Defended Targets, Average Vector Threat Score.
  * **Geo Side Panel (`GeoSidePanel.tsx`):** Country attack volume rankings, active threat feed, quick "Fly-To" buttons that re-center the map on specific hostile clusters.
* **Where the Data Comes From:**
  * Live Backend: `GET /api/dashboard/geo-attacks` (`backend/src/dashboard/dashboard.service.ts`).
  * Fallback: `mockGeoAttackData` (`lib/mock-data.ts`).
* **Which API / Backend Service It Uses:** `GET /api/dashboard/geo-attacks`.
* **Which Database Is Involved:** MongoDB (`security_logs` collection filtered by `latitude: { $ne: null }` over the last 30 days).
* **Whether AI/ML Is Involved:** Indirectly. The threat score associated with each origin pin is computed by the ML pipeline.
* **Why the Feature Exists:** Enables immediate recognition of coordinated distributed attacks and geo-targeted cyber campaigns.

---

### 4.9 Automated Security Reports (`/reports`)

* **Page Name:** SOC Compliance & Executive Security Reports Engine
* **Route:** `/reports`
* **Source File:** `frontend/src/app/(dashboard)/reports/page.tsx`
* **What the Page Is For:** Compiling, previewing, and exporting enterprise security audits, compliance records, and executive summary briefs.
* **Who Would Use It in an Enterprise:** Compliance Officers (ISO 27001, SOC 2, HIPAA), SOC Managers, External Security Auditors.
* **What Information It Displays:**
  * **Executive Report Cards & Archive:** List of generated reports with Title, Time Scope (Daily, Weekly, Monthly, Incident), Format (PDF, CSV), Generation Timestamp, and Author.
  * **Interactive Report Reader Drawer (`ReportDetailDrawer`):**
    * Risk Posture Badge (`CRITICAL`, `ELEVATED`, `MODERATE`, `NORMAL`).
    * Executive metrics: Total logs analyzed, anomalies detected, active alerts, blocked IPs.
    * Severity breakdown bar and incident status breakdown.
    * Top threat categories, offending IP addresses, and targeted ports.
    * Actionable prioritized remediation recommendations checklist.
  * **Report Generator Modal (`ReportGeneratorModal`):**
    * Scope selection (Daily, Weekly, Monthly, Incident).
    * Format selection (PDF Executive Brief or CSV Audit Telemetry).
    * Dynamic live preview showing telemetry counts before generation.
  * **Download Controls:** Direct download buttons streaming generated PDF and CSV files from the backend.
* **Where the Data Comes From:**
  * Aggregated live from both MongoDB (`security_logs`) and PostgreSQL (`alerts`, `threat_scores`, `blocked_ips`).
* **Which API / Backend Service It Uses:**
  * `GET /api/reports`: Lists generated reports.
  * `GET /api/reports/preview`: Real-time on-the-fly telemetry pre-computation.
  * `POST /api/reports`: Triggers asynchronous report compilation (`backend/src/reports/reports.service.ts`).
  * `GET /api/reports/:id/download`: Authenticated file download stream.
* **Which Database Is Involved:**
  * PostgreSQL: Stores report records and metadata in the `reports` table.
  * MongoDB: Queried for log metrics and anomaly statistics.
  * File System: Physical files written to `backend/storage/reports/<uuid>.<pdf|csv>`.
* **Whether AI/ML Is Involved:** Indirectly. Reports summarize anomaly detection rates, threat scores, and ML-generated alerts.
* **Why the Feature Exists:** Enterprise security programs require verifiable paper trails for regulatory compliance, board oversight, and insurance reporting.

---

### 4.10 User Management (`/users`)

* **Page Name:** Enterprise User & RBAC Management Panel
* **Route:** `/users`
* **Source File:** `frontend/src/app/(dashboard)/users/page.tsx`
* **What the Page Is For:** Administrative control over operator accounts, role assignments, and access revocation.
* **Who Would Use It in an Enterprise:** Chief Security Administrator, IT Identity Team.
* **What Information It Displays:**
  * Feature overview cards: "Create Users", "RBAC Roles (Admin, Analyst, Viewer)", "Activity Log", "Access Control".
  * Implementation status pill: **"Coming in Phase 4"**.
* **Current Code Reality:**
  * **Frontend:** A designed visual placeholder page (`min-h-[70vh]`, glassmorphic card) explicitly marked "Coming in Phase 4". It contains no functional buttons, tables, or API hooks.
  * **Backend Status:** The backend implementation is **already fully completed** in `backend/src/users/users.controller.ts` and `users.service.ts` (`GET /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id`).
* **Which Database Is Involved:** PostgreSQL (`users` table via Prisma).
* **Whether AI/ML Is Involved:** No.
* **Why the Feature Exists:** Enforces the principle of least privilege across SOC team tiers.

---

### 4.11 System Settings (`/settings`)

* **Page Name:** Platform Configuration & Detection Rules Panel
* **Route:** `/settings`
* **Source File:** `frontend/src/app/(dashboard)/settings/page.tsx`
* **What the Page Is For:** Adjusting alert firing thresholds, notification webhooks, and log retention lifecycles.
* **Who Would Use It in an Enterprise:** Lead Security Architect, SOC Operations Manager.
* **What Information It Displays:**
  * Configurable domain cards: "Thresholds (Threat score limits)", "Notifications (Alert preferences)", "Retention (Log storage policies)", "API Keys (Integration keys)".
  * Implementation status pill: **"Coming in Phase 4"**.
* **Current Code Reality:**
  * **Frontend:** A designed visual placeholder page explicitly marked "Coming in Phase 4".
  * **Backend Status:** Database schema exists (`NotificationSetting` in `schema.prisma`), but API endpoints for dynamic threshold adjustment are planned for Phase 4. Currently, thresholds are set via environment variables (`THREAT_THRESHOLD=60`).
* **Whether AI/ML Is Involved:** No.
* **Why the Feature Exists:** Allows tuning sensitivity to reduce false positives as enterprise baseline traffic shifts.

---

## 5. Interactive Controls, Buttons & Action Trace Audit

| Page | UI Control / Button Name | User Action | Backend / API Endpoint | Database Effect | Functional Status | Code File & Line |
|---|---|---|---|---|---|---|
| **Auth** | `Sign In` Button | Submits credentials | `POST /api/auth/login` | Updates `lastLoginAt` and `lastLoginIp` in Postgres `users` | **Fully Functional** | `login/page.tsx:69` |
| **Auth** | `Create Account` Button | Submits new account | `POST /api/auth/register` | Inserts new record into Postgres `users` | **Fully Functional** | `login/page.tsx:98` |
| **Overview** | `Sync / Refresh` Button | Clicks circular arrow | `GET /api/dashboard/*` (6 endpoints) | None (Read-only query) | **Fully Functional** | `overview/page.tsx:327` |
| **Overview** | `Time Horizon Filter` (7d, 30d, 90d) | Selects dropdown | Client state change | None (Filters trend visualization) | **Functional (UI)** | `threat-trend-chart.tsx` |
| **Logs** | `Ingest Log` Button | Opens modal dialog | None (Opens modal) | None | **Fully Functional** | `logs/page.tsx:340` |
| **Logs** | `Submit Single Log` | Submits form | `POST /api/logs` | 1. Inserts into Mongo `security_logs`<br>2. Enqueues BullMQ job | **Fully Functional** | `logs/page.tsx:205` |
| **Logs** | `Import Bulk JSON` | Pastes JSON & submits | `POST /api/logs/bulk` | Inserts batch of docs into Mongo `security_logs` | **Fully Functional** | `logs/page.tsx:290` |
| **Logs** | `Row Click / Inspect` | Clicks log row | Client state | None (Opens `LogDetailDrawer`) | **Fully Functional** | `logs/page.tsx:420` |
| **Logs** | `Filter & Search Inputs` | Types IP or selects severity | `GET /api/logs?...` | None (Debounced query) | **Fully Functional** | `logs/page.tsx:380` |
| **Alerts** | `Sync` Button | Clicks refresh | `GET /api/alerts` | None (Read-only query) | **Fully Functional** | `alerts/page.tsx:329` |
| **Alerts** | `Resolve` Button | Clicks checkmark | `PATCH /api/alerts/:id` | Updates status to `RESOLVED` in Postgres `alerts` | **Functional with Fix** *(See note below)* | `alerts/page.tsx:196` |
| **Alerts** | `Investigate` Button | Clicks eye icon | `PATCH /api/alerts/:id` | Updates status to `INVESTIGATING` in Postgres | **Functional with Fix** *(See note below)* | `alerts/page.tsx:196` |
| **Alerts** | `False Positive` Button | Clicks cross icon | `PATCH /api/alerts/:id` | Updates status to `FALSE_POSITIVE` in Postgres | **Functional with Fix** *(See note below)* | `alerts/page.tsx:196` |
| **Alerts** | `Severity Tabs` | Clicks Critical/High/etc. | Client state filter | None (Filters local alerts array) | **Fully Functional** | `alerts/page.tsx:210` |
| **Predictions**| `Run Forecast / Window` | Selects 6h/12h/24h | `POST /api/predictions` | Reads Mongo logs; no writes | **Fully Functional** | `predictions/page.tsx:49` |
| **Predictions**| `Simulation Preset` | Clicks scenario button | `POST /api/predictions` | No DB write (Sends synthetic payload to ML) | **Fully Functional** | `predictions/page.tsx:82` |
| **Predictions**| `Countermeasure Checkbox` | Toggles mitigation item | Client local state | None (Session triage checklist) | **Functional (UI)** | `predictions/page.tsx:93` |
| **Geo Map** | `Sync / Refresh` | Clicks refresh | `GET /api/dashboard/geo-attacks` | None (Queries Mongo geo-tagged logs) | **Fully Functional** | `geo-map/page.tsx:187` |
| **Geo Map** | `Fly To Origin` Button | Clicks target icon | Client Leaflet method | None (Smooth flyTo animation) | **Fully Functional** | `geo-map/page.tsx:194` |
| **Reports** | `New Report` Button | Clicks button | `GET /api/reports/preview` | None (Pre-computes live telemetry) | **Fully Functional** | `reports/page.tsx:120` |
| **Reports** | `Generate Report` Modal | Selects scope & format | `POST /api/reports` | 1. Generates PDF/CSV on disk<br>2. Inserts into Postgres `reports` | **Fully Functional** | `reports/page.tsx:210` |
| **Reports** | `Download` Button | Clicks PDF/CSV icon | `GET /api/reports/:id/download` | Direct streaming binary download | **Fully Functional** | `reports/page.tsx:340` |
| **Reports** | `Row Click / View` | Clicks report card | None (Opens reader drawer) | None (Displays full executive breakdown) | **Fully Functional** | `reports/page.tsx:310` |
| **Users** | All Action Buttons | None | None | None | **Planned (Phase 4)** | `users/page.tsx:29` |
| **Settings** | All Slider Controls | None | None | None | **Planned (Phase 4)** | `settings/page.tsx:29` |

> [!NOTE]
> **Code Audit Finding on Alert Status Actions:**  
> In `frontend/src/app/(dashboard)/alerts/page.tsx` line 196, the action handler attempts:  
> `await api.patch('/alerts/' + alertId + '/status', { status: newStatus });`  
> In `backend/src/alerts/alerts.controller.ts` line 65, the route is declared as:  
> `@Patch(':id')` (matching `/api/alerts/:id`).  
> In the demo/offline fallback mode (`isDemo = true`), the UI performs an immediate optimistic state update. When connected to live data, calling `/status` would return a 404 error unless routed through a path rewrite or updated to `/alerts/:id`. Keep this distinction in mind if demonstrating live alert resolution.

---

## 6. Machine Learning & Artificial Intelligence: The Ground Truth

---

### 6.1 Summary Taxonomy

To defend your project with 100% academic integrity, use this strict classification:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI / ML SUBSYSTEM REALITY                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. GENUINE UNSUPERVISED ML:   Isolation Forest (200 Trees)             │
│                               One-Class SVM (RBF Kernel)               │
│                               StandardScaler Feature Normalization     │
│                               SHAP TreeExplainer Attribution Engine    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HEURISTIC / RULE-BASED:    Weighted Threat Scorer (0–100 formula)   │
│                               Attack Predictor (Sliding-window expert) │
│                               Event-to-Alert Mapping Dictionary        │
│                               Alert Threshold Trigger (Score ≥ 60)     │
├────────────────────────────────────────────────────────────────────────┤
│ 3. SIMULATED / DEMO:          Client-side localStorage telemetryStore  │
│                               (Simulates 1.25M scale for UI demo)      │
│                               Simulation Presets in Predictions Page   │
├────────────────────────────────────────────────────────────────────────┤
│ 4. PLANNED / ROADMAP:         Supervised Multi-Class Classifier        │
│                               (CIC-IDS2017 Random Forest / XGBoost)    │
│                               Dynamic Adaptive Threshold Learning      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Model 1: Isolation Forest (Genuine Unsupervised ML)

* **Algorithm:** `sklearn.ensemble.IsolationForest`
* **File Location:** `ml-service/app/services/anomaly_detector.py:74-80`
* **Purpose:** Detects outliers in multidimensional network telemetry without requiring labeled attack examples.
* **How It Works Technically:** Isolates observations by randomly selecting a feature and randomly selecting a split value between the maximum and minimum values of the selected feature. Anomalous points require significantly fewer random splits (shorter tree path length) to isolate than normal points.
* **Hyperparameters Configured:**
  * `n_estimators = 200` (Ensemble of 200 decision trees)
  * `contamination = 0.05` (Assumes ~5% baseline noise)
  * `random_state = 42` (Deterministic reproducibility)
* **Input Data:** Normalized 8-dimensional feature vector ($1 \times 8$ float64 array).
* **Output:** Continuous anomaly score normalized to $[0.0, 1.0]$ where $0.0$ is completely normal and $1.0$ is severely anomalous.

---

### 6.3 Model 2: One-Class Support Vector Machine (Genuine ML)

* **Algorithm:** `sklearn.svm.OneClassSVM`
* **File Location:** `ml-service/app/services/anomaly_detector.py:82-87`
* **Purpose:** Complements the Isolation Forest by learning a non-linear geometric boundary around normal traffic.
* **How It Works Technically:** Projects the 8-dimensional feature vectors into an infinite-dimensional Hilbert space using a Radial Basis Function (RBF) kernel and finds the maximal-margin hyperplane separating normal baseline data from the origin.
* **Hyperparameters Configured:**
  * `kernel = 'rbf'` (Radial Basis Function Gaussian kernel)
  * `nu = 0.05` (Upper bound on training margin errors)
  * `gamma = 'scale'` ($1 / (n\_features \times X.var())$)
* **Ensemble Fusion:** The raw decision functions of both Isolation Forest and One-Class SVM are normalized against training baseline boundaries, inverted, and averaged:
  $$\text{AnomalyScore} = \frac{\text{Norm}(IF_{\text{raw}}) + \text{Norm}(SVM_{\text{raw}})}{2} \in [0.0, 1.0]$$

---

### 6.4 Feature Extraction & Standardization

Every raw security log is converted into an 8-dimensional numerical vector in `ml-service/app/utils/preprocessing.py`:

| Index | Feature Name | Data Type | Value Range | Mathematical & Business Logic |
|---|---|---|---|---|
| **0** | `hour` | `float64` | $0.0 - 23.0$ | Extracted from ISO timestamp. Captures off-hours activity. |
| **1** | `is_login_failure` | `float64` | $0.0 \lor 1.0$ | Binary flag: $1.0$ if `"LOGIN_FAILURE"` or `"FAILURE"` in event type. |
| **2** | `protocol_risk` | `float64` | $0.1 - 0.8$ | Lookup table: SSH ($0.7$), FTP ($0.8$), HTTP ($0.2$), HTTPS ($0.1$). |
| **3** | `source_weight` | `float64` | $0.3 - 0.8$ | Trust weighting: IDS ($0.8$), Antivirus ($0.7$), Firewall ($0.6$), Cloud ($0.3$). |
| **4** | `country_risk` | `float64` | $0.1 - 1.0$ | Geopolitical risk: $1.0$ for high-risk origins (RU, CN, KP, IR, NG), $0.1$ for standard. |
| **5** | `severity_level` | `float64` | $1.0 - 4.0$ | Ordinal mapping: LOW ($1$), MEDIUM ($2$), HIGH ($3$), CRITICAL ($4$). |
| **6** | `port_risk` | `float64` | $0.1 - 0.9$ | Sensitive ports: Telnet 23 ($0.9$), RDP 3389 ($0.8$), SSH 22 ($0.7$), HTTPS 443 ($0.1$). |
| **7** | `action_type` | `float64` | $0.0 - 0.9$ | Policy enforcement: ALLOW ($0.0$), DENY ($0.6$), DROP ($0.7$), BLOCK ($0.9$). |

* **Standardization:** Passed through `sklearn.preprocessing.StandardScaler` (Z-score normalization: $z = \frac{x - \mu}{\sigma}$) fitted on the baseline dataset.
* **Persisted Model Artifacts:** Saved under `ml-service/models/`:
  * `isolation_forest.joblib`
  * `ocsvm.joblib`
  * `scaler.joblib`
  * `model_meta.joblib`

---

### 6.5 Explainable AI (SHAP TreeExplainer & Heuristic Fallback)

* **Engine:** `ml-service/app/services/explainer.py`
* **Method:** `shap.TreeExplainer` calculated on the Isolation Forest decision trees.
* **Output:** Computes Shapley values ($\phi_i$) representing each feature's contribution to the anomaly score. Translates mathematical attributions into plain English statements for the SOC analyst (e.g., *"Unusual off-hours activity at 03:00 UTC"*, *"Targeted port 3389 (RDP) carries elevated exposure risk"*).
* **Robustness Guarantee:** If the SHAP library encounters a numerical exception or incompatible environment, the service seamlessly falls back to a deterministic heuristic explanation generator so the API **never** fails to return reasons.

---

### 6.6 Composite Threat Scorer (Rule-Based Weighted Formula)

* **Engine:** `ml-service/app/services/threat_scorer.py`
* **Nature:** **Deterministic Mathematical Formula (Not an ML model)**.
* **Formula:**
  $$\text{ThreatScore} = \text{round}\Big(35 \cdot A + 20 \cdot L + 15 \cdot C + 15 \cdot P + 15 \cdot S\Big) \in [0, 100]$$
  Where:
  * $A$: ML Anomaly Score ($[0.0, 1.0]$) $\times 35$
  * $L$: Login Failure Indicator ($0.0 \lor 1.0$) $\times 20$
  * $C$: Country Risk Factor ($[0.1, 1.0]$) $\times 15$
  * $P$: Destination Port Risk ($[0.1, 1.0]$) $\times 15$
  * $S$: Event Severity Weight ($[0.1, 1.0]$) $\times 15$
* **Category Mapping:**
  * `SAFE`: $0 - 19$
  * `LOW_RISK`: $20 - 39$
  * `MEDIUM_RISK`: $40 - 59$
  * `HIGH_RISK`: $60 - 79$
  * `CRITICAL`: $80 - 100$

---

### 6.7 Attack Predictor / Forecaster (Expert Heuristic Engine)

* **Engine:** `ml-service/app/services/predictor.py` (906 lines of code).
* **Nature:** **Sliding-Window Statistical Expert System (Not a deep neural net or LSTM)**.
* **Mechanism:** Computes sliding-window aggregates over recent logs (failed login frequencies, unique source IP fan-out, port entropy, off-hours ratios). Evaluates 8 multi-stage attack scenarios:
  1. `BRUTE_FORCE`: Escalating login failure velocity from single or clustered IPs.
  2. `PORT_SCAN_RECON`: Broad port probe patterns preceding exploit attempts.
  3. `GEOGRAPHIC_ANOMALY`: Rapid velocity across unexpected international jurisdictions.
  4. `DDOS_BUILDUP`: High-volume packet floods and connection exhaustion indicators.
  5. `DATA_EXFILTRATION`: Unusual off-hours volume transfers over non-standard outbound ports.
  6. `INSIDER_THREAT`: Privilege escalation events followed by sensitive data access.
  7. `MALWARE_PROPAGATION`: Antivirus detections coupled with lateral movement attempts.
  8. `ZERO_DAY_ANOMALY`: Severe ML anomaly score with no matching known signature.
* **Output:** Probability ($0.0 - 1.0$), confidence score, estimated attack timeframe (e.g., "1–4 hours"), affected asset targets, and actionable remediation checklists.

---

### 6.8 Attack Type Classification (Dictionary Mapping / Ground Truth)

* **Code Location:** `backend/src/jobs/logs.processor.ts:216-230`
* **Nature:** **Hardcoded TypeScript Dictionary (Label Transfer)**.
* **Current Implementation:**
  ```typescript
  private mapEventTypeToAlertType(eventType: string): AlertType {
    const mapping: Record<string, AlertType> = {
      LOGIN_FAILURE: 'BRUTE_FORCE',
      BRUTE_FORCE: 'BRUTE_FORCE',
      PORT_SCAN: 'PORT_SCAN',
      DDOS: 'DDOS',
      MALWARE_DETECTED: 'MALWARE',
      MALWARE: 'MALWARE',
      CREDENTIAL_STUFFING: 'CREDENTIAL_STUFFING',
      INSIDER_THREAT: 'INSIDER_THREAT',
      UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
      SUSPICIOUS_LOGIN: 'SUSPICIOUS_LOGIN',
    };
    return mapping[eventType] ?? 'SUSPICIOUS_LOGIN';
  }
  ```
* **Academic Explanation:** The current system uses unsupervised ML to detect **that** an anomaly occurred and quantify **how dangerous** it is. It maps the event type to an alert category via rule-based logic. Replacing this dictionary with a supervised Random Forest / XGBoost classifier trained on benchmark datasets (e.g., CIC-IDS2017) represents Phase 4 of the roadmap.

---

## 7. Enterprise Workflow: End-to-End Data Pipeline

Here is the exact technical trace of an event travelling through your system:

```
[1] Enterprise Source (Windows Event Log / Firewall / Syslog)
  │
  ▼
[2] Ingestion / Normalization Layer
  │ • Windows Collector (`tools/windows-log-collector/collector.py`)
  │ • Normalizer maps Event ID 4625 → `LOGIN_FAILURE`, action: `DENY`
  │ • Authenticates via JWT and sends HTTP POST `/api/logs/bulk`
  ▼
[3] NestJS REST Gateway (`LogsController.createBulk()` in `logs.controller.ts`)
  │ • Validates schema conformity via `BulkCreateLogsDto`
  │ • Inserts raw document into MongoDB `security_logs` collection
  │ • Enqueues job `{ logId: doc._id }` into Redis BullMQ queue `log-processing`
  │ • Returns HTTP 201 response immediately (< 20ms)
  ▼
[4] Asynchronous Worker (`LogsProcessor.process()` in `jobs/logs.processor.ts`)
  │ • Dequeues job from Redis
  │ • Retrieves complete log record from MongoDB by `logId`
  │ • Forwards log to Python FastAPI ML service (`POST http://localhost:8000/api/v1/detect`)
  ▼
[5] FastAPI ML Microservice (`ml-service/app/main.py`)
  │ • `extract_features()`: Extracts 8-dimensional numeric vector
  │ • `StandardScaler`: Normalizes vector against baseline distribution
  │ • `AnomalyDetector`: Evaluates Isolation Forest (200 trees) + One-Class SVM
  │ • `ThreatScorer`: Computes composite weighted score (0–100)
  │ • `ThreatExplainer`: Computes SHAP Shapley values and human-readable reasons
  │ • Returns JSON `{ anomaly_score: 0.84, threat_score: 88, category: "CRITICAL", reasons: [...] }`
  ▼
[6] Worker Post-Processing & Alert Generation
  │ • Updates MongoDB log document: `isProcessed: true`, `threatScore: 88`, `anomalyScore: 0.84`
  │ • Checks threshold: `if (threatScore >= 60)`:
  │     - Maps `eventType` to `AlertType` enum (`BRUTE_FORCE`)
  │     - Maps score to `Severity` enum (`CRITICAL`)
  │     - Inserts structured `Alert` record into PostgreSQL via Prisma
  ▼
[7] SOC Analyst Console (Next.js Frontend)
  │ • Dashboard Overview (`/overview`) updates live statistics and Recharts graphs
  │ • Alerts Console (`/alerts`) displays alert card with SHAP reasons
  │ • Spatial Map (`/geo-map`) plots attack vector ballistic arc
  │ • Reports Engine (`/reports`) incorporates incident into executive PDF brief
```

---

## 8. Log Ingestion & Log Normalization Investigation

A critical requirement of any enterprise SIEM is converting diverse, messy log formats from different vendors into a unified schema. Here is the exact status in your repository:

### 8.1 Where the Normalizer Resides
* **Path:** `tools/windows-log-collector/normalizer.py`
* **Accompanying Scripts:**
  * `win_events.py`: Reads raw Windows Event Log channels using `wevtutil` / PowerShell.
  * `collector.py`: Autonomous background daemon with watermarking (`.collector_state.json`), JWT authentication, and bulk ingestion streaming.

### 8.2 Supported Input Formats & Channels
The normalizer specifically parses live Windows OS event channels:
1. **Windows Security Channel:**
   * `4624`: Successful Logon $\rightarrow$ `LOGIN_SUCCESS` (Port 3389 for RDP LogonType 10, Port 445 for SMB LogonType 3).
   * `4625`: Failed Logon $\rightarrow$ `LOGIN_FAILURE` (Severity `HIGH`, Action `DENY`).
   * `4634`: Logoff session termination $\rightarrow$ `LOGOFF`.
   * `4648`: Explicit credential logon $\rightarrow$ `EXPLICIT_CREDENTIAL_LOGON`.
   * `4672`: Special administrative privileges assigned $\rightarrow$ `PRIVILEGE_ASSIGNED`.
   * `4688`: New process execution $\rightarrow$ `PROCESS_CREATION` (Captures process and parent names).
   * `4720`: User account created $\rightarrow$ `ACCOUNT_CREATED`.
   * `4726`: User account deleted $\rightarrow$ `ACCOUNT_DELETED`.
   * `4740`: Account locked out due to brute force $\rightarrow$ `ACCOUNT_LOCKED` (Severity `CRITICAL`).
2. **Microsoft Defender Channel:**
   * `1116` / `1117`: Malware detected or blocked $\rightarrow$ `MALWARE_DETECTED` (Severity `CRITICAL`, Action `DROP`).
   * `1000` / `1001`: Defender scan completed $\rightarrow$ `ANTIVIRUS_SCAN`.
   * `5007`: Antivirus real-time protection modified $\rightarrow$ `CONFIG_CHANGE`.
3. **Windows System Channel:**
   * `7045`: New Windows system service installed $\rightarrow$ `SERVICE_INSTALLED` (Severity `HIGH`).
   * `10016`: DCOM security activation permission denied $\rightarrow$ `PERMISSION_DENIED`.
   * `7036`: Service state transition $\rightarrow$ `SERVICE_STATUS_CHANGE`.
   * `41`: Kernel reboot without clean shutdown $\rightarrow$ `SYSTEM_SHUTDOWN`.

### 8.3 Field Mappings & Transformations
The normalizer extracts fragmented XML/EventData dictionaries and maps them directly to the backend's standard `SecurityLog` schema:

```
Windows Event Field                    Standardized SecurityLog Field
──────────────────────────────────────────────────────────────────────
TargetUserName / SubjectUserName   ──> userName
TargetUserSid / SubjectUserSid     ──> userId
IpAddress / ClientIP               ──> sourceIp (Sanitized, handles IPv6/local)
Destination Port (LogonType logic) ──> destinationPort (3389, 445, or 0)
Calculated severity                ──> severity ("CRITICAL" | "HIGH" | "MEDIUM" | "LOW")
Calculated action                  ──> action ("ALLOW" | "DENY" | "DROP" | "ALERT")
Derived event name                 ──> eventType ("LOGIN_FAILURE", "MALWARE_DETECTED")
Formatted summary message          ──> message
Channel, EventID, Computer         ──> rawData (Preserved as unflattened JSON)
"WINDOWS_SECURITY" / "ANTIVIRUS"   ──> source
```

### 8.4 Data Destination
Once normalized, the dictionary is sent via HTTP POST to the backend endpoint `/api/logs/bulk`. It is persisted into MongoDB's `security_logs` collection and immediately processed by the ML anomaly pipeline.

### 8.5 Connection to Ingestion Pipeline
* **Is it connected?** **YES, as an autonomous external collector agent.** The Python collector script (`collector.py`) automatically logs in as `admin@cti.com`, obtains a JWT Bearer token, reads real Windows security events, normalizes them, and streams them into NestJS `/api/logs/bulk`.
* **Backend Middleware Status:** The NestJS API itself expects the incoming payload to **already** conform to the `CreateLogDto` schema. The backend does not currently embed an internal Syslog listener (UDP 514) or inline regex converter for raw CEF (Common Event Format) / LEEF strings inside the NestJS process.

### 8.6 Roadmap for Production Enterprise Ingestion
To integrate this into a Fortune 500 enterprise datacenter:
1. **Log Forwarder Pipeline:** Deploy standard enterprise collectors (Logstash, Fluentbit, or Vector) at the network edge to parse Syslog, Cisco ASA, Palo Alto PAN-OS, and AWS CloudTrail into JSON matching `CreateLogDto`.
2. **Buffer Queue:** Introduce an Apache Kafka cluster in front of NestJS to absorb burst traffic of 50,000+ logs per second during distributed DDoS events.
3. **Wazuh / osquery Endpoint Integration:** Package `collector.py` as an installable Windows Service / Linux daemon managed via central policy.

---

## 9. Backend Controllers & REST API Catalog

All endpoints require JWT Bearer authentication (`JwtAuthGuard`) unless marked Public.

### Authentication (`backend/src/auth/`)
* `POST /api/auth/register` — Register a new account (`RegisterDto`). [Public]
* `POST /api/auth/login` — Authenticate credentials; returns `{ accessToken, refreshToken, user }`. [Public]
* `POST /api/auth/refresh` — Issue fresh access token using refresh token. [Public]
* `GET /api/auth/profile` — Get authenticated user details. [Any authenticated role]

### Security Logs (`backend/src/logs/`)
* `GET /api/logs` — Query paginated logs with multi-parameter filtering. [Any role]
* `GET /api/logs/stats` — Ingested log aggregation statistics (by severity, source, action, top IPs). [Any role]
* `GET /api/logs/:id` — Retrieve single raw log by MongoDB ObjectId. [Any role]
* `POST /api/logs` — Ingest single log document. [`ADMIN`, `ANALYST`]
* `POST /api/logs/bulk` — Ingest batch of log documents. [`ADMIN`, `ANALYST`]

### Alerts (`backend/src/alerts/`)
* `GET /api/alerts` — Query paginated security incident alerts with filters. [Any role]
* `GET /api/alerts/stats` — Metrics on active, investigating, resolved, and critical alerts. [Any role]
* `GET /api/alerts/:id` — Retrieve full alert details by UUID. [Any role]
* `PATCH /api/alerts/:id` — Update alert status, assignee, or resolution notes. [`ADMIN`, `ANALYST`]

### Dashboard Aggregations (`backend/src/dashboard/`)
* `GET /api/dashboard/stats` — Overall counts (Total logs, alerts, users, blocked IPs, avg threat score). [Any role]
* `GET /api/dashboard/threat-trends` — 30-day temporal breakdown of threats and allowed traffic. [Any role]
* `GET /api/dashboard/severity-distribution` — Grouping by Critical, High, Medium, Low. [Any role]
* `GET /api/dashboard/attack-frequency` — Grouping by attack types. [Any role]
* `GET /api/dashboard/top-sources` — Top attacking IP addresses and country origins. [Any role]
* `GET /api/dashboard/recent-activity` — Blended chronological feed of logs and alerts. [Any role]
* `GET /api/dashboard/geo-attacks` — Geo-coordinates of attack origins over past 30 days. [Any role]

### Threat Intelligence Entities (`backend/src/threats/`)
* `GET /api/threats` — Query entity profiles with 5-factor risk breakdowns and score histories. [Any role]
* `GET /api/threats/summary` — Aggregate distribution of entities across risk categories. [Any role]
* `GET /api/threats/:id` — Individual entity record. [Any role]

### Predictive Forecasting (`backend/src/predictions/`)
* `POST /api/predictions` — Forward recent logs to ML service to forecast attack scenarios. [Any role]
* `GET /api/predictions/forecast` — Quick baseline forecast for a specified lookback window. [Any role]

### Security Reports (`backend/src/reports/`)
* `GET /api/reports` — List generated PDF/CSV reports. [Any role]
* `GET /api/reports/preview` — Real-time telemetry preview before compiling. [Any role]
* `POST /api/reports` — Asynchronously compile PDF or CSV report and save to disk. [`ADMIN`, `ANALYST`]
* `GET /api/reports/:id` — Report metadata by UUID. [Any role]
* `GET /api/reports/:id/download` — Stream binary PDF/CSV file with proper MIME headers. [Any role]

### User Administration (`backend/src/users/`)
* `GET /api/users` — List all registered platform users. [`ADMIN`]
* `GET /api/users/:id` — User profile details. [`ADMIN`]
* `PATCH /api/users/:id` — Update role, activation status, or profile. [`ADMIN`]
* `DELETE /api/users/:id` — Deactivate user account. [`ADMIN`]

---

## 10. Infrastructure, Docker & Service Orchestration

The platform is orchestrated via `docker-compose.yml` defining 5 containers:

| Container Name | Service | Image | Internal Port | Host Port | Purpose |
|---|---|---|---|---|---|
| `cti-postgres` | PostgreSQL 16 | `postgres:16-alpine` | `5432` | `5432` | Relational ACID store (Users, Alerts, Reports) |
| `cti-mongodb` | MongoDB 7 | `mongo:7` | `27017` | `27017` | Flexible document lake for polymorphic security logs |
| `cti-redis` | Redis 7 | `redis:7-alpine` | `6379` | `6379` | In-memory message broker & job queue for BullMQ |
| `cti-mongo-express`| Mongo Web GUI | `mongo-express:latest`| `8081` | `8081` | Direct visual database browser for raw MongoDB data |
| `cti-ml-service` | FastAPI ML | Built from `./ml-service` | `8000` | `8000` | Python runtime executing Scikit-Learn models |

### Automation Scripts (`/scripts` and root):
* `start.bat`: One-click Windows launcher executing `start-all.ps1`.
* `scripts/start-all.ps1`:
  1. Verifies/launches Docker Desktop.
  2. Runs `docker compose up -d` and waits for container healthchecks.
  3. Verifies PostgreSQL port availability (resolves port 5432 conflicts).
  4. Launches NestJS backend (`npm run start:dev` on port 3001).
  5. Launches Next.js frontend (`npm run dev` on port 3000).
  6. Automatically opens default browser to `http://localhost:3000`.
* `scripts/status-all.ps1`: Inspects all 5 containers, Node processes, and ports.
* `scripts/stop-all.ps1`: Gracefully terminates background Node processes and containers.

---

## 11. Implementation Truth Table

| Feature / Module | Implemented | Backend Connected | Real Data | Demo/Simulated | Notes |
|---|:---:|:---:|:---:|:---:|---|
| **User Registration & Login** | ✅ | ✅ | ✅ | ❌ | JWT + bcrypt 12 rounds. Persisted in PostgreSQL. |
| **RBAC Route Guards** | ✅ | ✅ | ✅ | ❌ | Enforced via `@Roles()` decorator and `RolesGuard`. |
| **Overview Dashboard StatCards**| ✅ | ✅ | ✅ | ⚠️ Hybrid | Shows real DB stats; syncs client-side uploads via `telemetryStore`. |
| **Overview Recharts Visuals** | ✅ | ✅ | ✅ | ⚠️ Fallback | Displays real DB aggregations; falls back to mock if backend offline. |
| **Security Logs Explorer Table**| ✅ | ✅ | ✅ | ❌ | Fully connected to MongoDB `security_logs` with pagination & filtering. |
| **Log Detail Drawer** | ✅ | ✅ | ✅ | ❌ | Inspects full raw JSON, network ports, and ML explanations. |
| **Single & Bulk Log Ingestion** | ✅ | ✅ | ✅ | ❌ | Directly connected to `POST /api/logs` and `/api/logs/bulk`. |
| **BullMQ Queue Processing** | ✅ | ✅ | ✅ | ❌ | Asynchronous Redis queue decouples ingestion from ML scoring. |
| **ML Anomaly Detection** | ✅ | ✅ | ✅ | ❌ | Scikit-Learn Isolation Forest (200 trees) + One-Class SVM. |
| **Feature Extraction (8-Dim)** | ✅ | ✅ | ✅ | ❌ | `hour`, `is_login_failure`, `protocol_risk`, `port_risk`, etc. |
| **Explainable AI (SHAP)** | ✅ | ✅ | ✅ | ❌ | `TreeExplainer` calculates exact feature Shapley values + fallback. |
| **Threat Scoring (0–100)** | ✅ | ✅ | ✅ | ❌ | Weighted mathematical formula combining ML and contextual signals. |
| **Automated Alert Generation** | ✅ | ✅ | ✅ | ❌ | Auto-creates PostgreSQL alert when `threatScore >= 60`. |
| **Alerts Management UI** | ✅ | ✅ | ✅ | ⚠️ Hybrid | Renders real DB alerts; action handler uses optimistic UI updates. |
| **Threat Entity Analysis** | ✅ | ✅ | ✅ | ⚠️ Fallback | Connected to `GET /api/threats`; falls back to mock if empty. |
| **Predictions / Forecasting** | ✅ | ✅ | ✅ | ⚠️ Hybrid | 900-line heuristic engine in `predictor.py`; includes simulation presets. |
| **Geographical Attack Map** | ✅ | ✅ | ✅ | ⚠️ Fallback | Interactive Leaflet canvas plotting real geo-coordinates from MongoDB. |
| **Executive Reports (PDF/CSV)** | ✅ | ✅ | ✅ | ❌ | PDFKit server generation with direct authenticated binary downloads. |
| **Windows Log Collector** | ✅ | ✅ | ✅ | ❌ | Python daemon parses genuine Windows Event Log & Defender channels. |
| **Windows Log Normalizer** | ✅ | ✅ | ✅ | ❌ | Converts Event IDs (4624, 4625, 1116) to standard `SecurityLog` schema. |
| **Supervised Attack Classifier**| ❌ | ❌ | ❌ | ❌ | **Roadmap (Phase 4):** Uses dictionary mapping in `logs.processor.ts`. |
| **User Management UI Page** | ⚠️ Stub | ❌ Frontend | N/A | ⚠️ Stub | UI is placeholder ("Coming in Phase 4"); Backend API is fully functional. |
| **System Settings UI Page** | ⚠️ Stub | ❌ Frontend | N/A | ⚠️ Stub | UI is placeholder ("Coming in Phase 4"); Configured via `.env`. |
| **Live WebSocket Push** | ❌ | ❌ | ❌ | ❌ | **Roadmap (Phase 4):** UI polls via HTTP refresh buttons. |

---

## 12. Faculty Q&A Preparation: Short, Easy Verbal Answers

#### Q1: What problem does your project solve?
> **Answer:** "Traditional SIEMs generate thousands of alerts every day, overwhelming analysts with alert fatigue. CyberShield AI solves this by using unsupervised machine learning to detect genuine behavioral anomalies, scoring composite risk from 0 to 100, and explaining exactly why an event was flagged using Explainable AI (SHAP)."

#### Q2: How is it different from a normal SIEM like Splunk or QRadar?
> **Answer:** "Traditional SIEMs rely almost entirely on static, human-written rules and signatures (like 'alert if 5 failed logins occur'). If an attacker flies under the radar or uses a zero-day exploit, rules miss it. CyberShield AI uses an ensemble of Isolation Forest and One-Class SVM to detect deviations from normal baseline behavior without needing a pre-existing signature."

#### Q3: How does a company feed logs into your system?
> **Answer:** "Through two primary channels: First, our REST API provides `/api/logs` and `/api/logs/bulk` endpoints that any standard log shipper like Fluentbit or Logstash can stream to. Second, we built a native Windows Security Collector agent that automatically reads Windows Event Logs, normalizes them, and forwards them using JWT authentication."

#### Q4: How are different log formats handled? Does normalization exist?
> **Answer:** "Yes. In `tools/windows-log-collector/normalizer.py`, we map raw Windows Event IDs—such as Event 4624 for successful logins, 4625 for failed logins, and Defender 1116 for malware—into our unified `SecurityLog` schema with standardized fields like `sourceIp`, `action`, `severity`, and `destinationPort`."

#### Q5: Where exactly is Artificial Intelligence used?
> **Answer:** "AI is used in our Python FastAPI microservice. Specifically:
> 1. Feature Extraction: We extract an 8-dimensional numerical feature matrix.
> 2. Anomaly Detection: An ensemble of an Isolation Forest with 200 trees and a One-Class SVM with an RBF kernel scores the behavioral deviation.
> 3. Explainability: SHAP TreeExplainer computes Shapley feature attributions to provide human-readable explanations."

#### Q6: What dataset trained your model?
> **Answer:** "Our anomaly detection models are unsupervised, meaning they train on normal baseline traffic rather than labeled attacks. During initialization, the system trains on baseline network telemetry representing standard business hours and safe communication channels. In our Phase 4 roadmap, we have designed the pipeline to train a supervised Random Forest on the benchmark CIC-IDS2017 dataset."

#### Q7: How does anomaly detection work technically?
> **Answer:** "We use an Isolation Forest and a One-Class SVM. Isolation Forest works on the principle that anomalies are few and different, meaning they require fewer random partition splits to isolate in feature space. One-Class SVM draws a non-linear geometric boundary around normal points. We invert and combine their decision scores to yield a normalized score between 0.0 and 1.0."

#### Q8: How does attack prediction work? Is it actual ML or heuristic?
> **Answer:** "It is an **Expert Statistical Heuristic Pattern Engine** implemented in 900 lines of Python. It analyzes sliding windows of recent logs—calculating failed login velocities, port scan fan-out, and off-hours ratios—to identify precursors of 8 multi-stage attack scenarios before compromise occurs."

#### Q9: How are alerts generated?
> **Answer:** "Asynchronously. When a log is ingested, it is placed into a Redis BullMQ queue. A background worker picks up the job, sends it to the ML service, and computes a composite threat score (0–100). If the score is 60 or higher, the worker automatically writes a structured `Alert` record into PostgreSQL."

#### Q10: How does the Geographical Attack Map work?
> **Answer:** "Our MongoDB database indexes attack logs containing latitude and longitude coordinates. The frontend uses Leaflet.js to render an interactive dark-mode map, plotting pulsing origin pins color-coded by severity, and drawing animated ballistic flight arcs connecting the attacker to the defended network target."

#### Q11: How would an enterprise deploy this? Can it run on private cloud?
> **Answer:** "Yes. The entire system is containerized using Docker Compose. An enterprise can deploy it on an on-premise Kubernetes cluster or private cloud (AWS, Azure, GCP). All data stays completely within the organization's private virtual network."

#### Q12: What happens when a malicious log is uploaded?
> **Answer:** "It is saved to MongoDB, enqueued in Redis, and evaluated by the ML service. The model detects the unusual port, off-hours timestamp, or failed login flag, generating a high anomaly score. The threat scorer assigns it a score $\ge 60$, triggering an automated Critical/High alert in PostgreSQL, which immediately appears in the SOC Alerts console with SHAP explanation reasons."

#### Q13: What are the current limitations of the project?
> **Answer:** "Two honest limitations: First, attack classification currently maps event types to alert types via a rule dictionary rather than a multi-class supervised classifier. Second, frontend live updates currently rely on polling and refresh buttons rather than full bidirectional WebSockets."

#### Q14: What would you improve before putting this into production?
> **Answer:** "Three things: First, train a supervised Random Forest classifier on the 50,000-record CIC-IDS2017 dataset for ML-driven attack naming. Second, deploy Apache Kafka to buffer millions of logs per second. Third, connect WebSocket gateways for real-time push notifications."

---

## 13. 10-Minute Faculty Demo Script

---

### Minute 0:00 – 1:30 | Architecture & Executive Context
* **Page to Open:** Landing Page (`http://localhost:3000/`)
* **What to Show:** Scroll smoothly past the hero section to the **System Architecture Visualizer** (`#ml-arch`).
* **Technical Action:** Click through the visualizer showing the microservices flow.
* **What to Say:**
  > *"Good morning, professors. Today I am presenting CyberShield AI, an enterprise-grade Cyber Threat Intelligence platform. In modern enterprise SOCs, analysts face thousands of logs a minute and suffer severe alert fatigue. CyberShield AI solves this with a 3-tier polyglot architecture: a Next.js frontend, a NestJS API orchestration gateway, and a Python FastAPI microservice running machine learning anomaly detection. Telemetry is persisted using polyglot persistence: MongoDB for flexible, high-volume raw logs, and PostgreSQL for relational ACID incident tracking."*

---

### Minute 1:30 – 3:30 | Log Ingestion & Data Lake Explorer
* **Page to Open:** Security Logs Explorer (`http://localhost:3000/logs`)
* **What to Show:**
  1. Show the live paginated logs table with severity pills and protocol tags.
  2. Click the **"Ingest Log"** button in the top right to open the modal.
  3. Submit a sample high-severity SSH login failure log (e.g., Source IP: `198.51.100.45`, Port: `22`, Action: `DENY`, Severity: `HIGH`, Event: `Login Failure`, Message: `Multiple failed SSH attempts`).
  4. Click on any row to open the **`LogDetailDrawer`**.
* **Technical Action:** Shows the asynchronous write to MongoDB, the raw JSON payload, and the ML diagnostic score.
* **What to Say:**
  > *"Here in the Security Logs Explorer, we see our raw data lake stored in MongoDB. When a security log arrives—either from our automated Windows collector or via API—it is ingested in under 20 milliseconds and queued in Redis using BullMQ. When we inspect a log, we see not just raw packet metadata, but the anomaly score and diagnostic reasons returned by our machine learning model."*

---

### Minute 3:30 – 5:30 | AI Incident Triage & Explainability
* **Page to Open:** Alerts Console (`http://localhost:3000/alerts`)
* **What to Show:**
  1. Point out the KPI ribbon (Active Triage, Critical Alerts, MTTD).
  2. Click on a **Critical Alert** card to expand it.
  3. Point directly to the **AI Threat Intelligence & Diagnostic Reasons** box.
  4. Click the **"Investigate"** or **"Resolve"** button to demonstrate status transitions.
* **Technical Action:** Explains how the background worker created the alert in PostgreSQL when `threatScore >= 60`.
* **What to Say:**
  > *"This is the heart of the SOC triage workflow. When our ML service scores an event at 60 or above, a structured alert is automatically created in PostgreSQL. Notice this critical section: 'AI Threat Intelligence'. This is powered by SHAP—Explainable AI. Rather than being a black box, the system explains to the analyst exactly why it flagged the event—for example, anomalous off-hours activity combined with a sensitive destination port."*

---

### Minute 5:30 – 7:00 | Spatial Threat Map & Situational Awareness
* **Page to Open:** Geographical Attack Map (`http://localhost:3000/geo-map`)
* **What to Show:**
  1. Show the interactive Leaflet dark-mode world map with ballistic attack arcs.
  2. In the right-hand **Geo Side Panel**, click the **target icon (Fly-To)** next to a top offending country (e.g., Russia or China).
* **Technical Action:** The Leaflet map smoothly animates and zooms into the coordinates of that threat cluster.
* **What to Say:**
  > *"For global situational awareness, the Geographical Attack Map aggregates geolocated telemetry from MongoDB over the last 30 days. It renders pulsing severity pins and ballistic trajectory arcs showing external attack vectors targeting our internal network enclave. Analysts can click any nation in the side panel to instantly fly to and inspect that regional cluster."*

---

### Minute 7:00 – 8:30 | Proactive Attack Forecasting
* **Page to Open:** Predictions Console (`http://localhost:3000/predictions`)
* **What to Show:**
  1. Select the lookback window dropdown (e.g., `24 Hours`).
  2. Click one of the **Simulation Presets** (e.g., *"Brute Force Wave"* or *"Zero-Day Exploit"*).
  3. Point out the probability gauge (e.g., `85% Probability`), confidence score, and the **Actionable Countermeasures Checklist**.
  4. Check off one or two countermeasure boxes.
* **Technical Action:** Demonstrates the forward-looking expert heuristic engine in `predictor.py`.
* **What to Say:**
  > *"While traditional systems only look backward at what already happened, CyberShield AI includes proactive attack forecasting. Our prediction engine analyzes sliding-window telemetry to detect attack buildup—such as port reconnaissance preceding a brute-force attack. It gives analysts an estimated time horizon and an interactive countermeasure checklist to contain the threat before data exfiltration occurs."*

---

### Minute 8:30 – 10:00 | Executive PDF Reports & Wrap-Up
* **Page to Open:** Security Reports (`http://localhost:3000/reports`)
* **What to Show:**
  1. Click **"Generate Report"** to open the modal.
  2. Point out the live telemetry preview. Select `Daily Executive Brief (PDF)` and click **"Generate Report"**.
  3. Click on the generated report card to open the **`ReportDetailDrawer`**.
  4. Click the **"Download PDF"** button to download the genuine PDF generated by the backend.
* **Technical Action:** PDFKit compiled real cross-database metrics into a formal audit brief stored on disk.
* **What to Say:**
  > *"Finally, compliance and executive visibility are handled by our Automated Reports Engine. With one click, the backend aggregates data from both PostgreSQL and MongoDB and compiles an executive PDF brief using PDFKit. The analyst can inspect executive metrics and remediation recommendations directly in the drawer or download the binary PDF for executive briefings. In conclusion, CyberShield AI provides an end-to-end, resilient, and explainable AI-powered SOC architecture."*

---

## 14. Crucial Defense Warnings: Claims You Must NOT Make

To protect yourself from critical faculty cross-examination, **DO NOT make any of the following claims**:

| ❌ FALSE CLAIM (Do NOT Say This) | ✅ ACCURATE STATEMENT (Say This Instead) | Why You Must Avoid the False Claim |
|---|---|---|
| *"We trained a Deep Neural Network / LSTM on millions of attack logs."* | *"We use an unsupervised ensemble of Isolation Forest (200 trees) and One-Class SVM with RBF kernel, which detects anomalies without requiring labeled attack training data."* | Looking in `ml-service`, there are no neural networks, PyTorch, or TensorFlow models. The models are Scikit-Learn decision trees and SVM. |
| *"Our AI automatically classifies attack types like DDoS and Brute Force with 99% accuracy."* | *"Our unsupervised ML detects anomalous behavior and calculates threat severity; attack naming is currently handled via structured event mapping, with supervised classification planned for Phase 4."* | `backend/src/jobs/logs.processor.ts:216` clearly shows a TypeScript dictionary mapping `eventType` strings to `AlertType`. Claiming ML classification will invite requests to see the confusion matrix. |
| *"Attack prediction uses a trained recurrent deep learning time-series model."* | *"Attack forecasting uses a 900-line statistical sliding-window heuristic expert system that correlates velocity, entropy, and temporal indicators across 8 attack scenarios."* | `ml-service/app/services/predictor.py` contains mathematical heuristic checks (`_check_brute_force`, `_check_recon_exploit`), not a machine-learned time-series model. |
| *"We trained our model on the CIC-IDS2017 or UNSW-NB15 dataset."* | *"Our anomaly detection model was trained on baseline normal operational telemetry. We have evaluated the CIC-IDS2017 benchmark dataset and designed a roadmap to train a supervised classifier on a 50k stratified sample in Phase 4."* | The repository does not contain raw CIC-IDS2017 CSV files. Claiming it will cause faculty to ask for training loss curves and dataset partitioning details. |
| *"Our dashboard shows 1.25 million live logs currently stored in our local database."* | *"Our database contains 10,000 seeded forensic logs; our client-side telemetry store maintains a synchronized 1.25M baseline scale to simulate enterprise-scale SOC load."* | `telemetry-store.ts` hardcodes `BASE_TOTAL_LOGS = 1248563` to simulate enterprise scale in the UI when displaying metrics. |
| *"The User Management and Settings pages are fully operational in the frontend."* | *"User management is fully implemented in the NestJS backend API; the frontend UI pages for User Management and System Settings are placeholders scheduled for Phase 4 completion."* | Inspecting `users/page.tsx` and `settings/page.tsx` shows they are static glassmorphic stubs displaying "Coming in Phase 4". |
| *"Alert triage status updates stream live to all analysts via WebSockets."* | *"Alert updates are persisted to PostgreSQL via REST API with optimistic UI updates in the client; persistent bidirectional WebSocket push is part of our Phase 4 roadmap."* | The frontend uses HTTP polling and manual refresh triggers; WebSocket subscriptions are not yet wired into the React components. |

---

*End of Comprehensive System Audit & Faculty Defense Guide.*  
*Generated from line-by-line inspection of repository: `cyber-threat-intel`.*
