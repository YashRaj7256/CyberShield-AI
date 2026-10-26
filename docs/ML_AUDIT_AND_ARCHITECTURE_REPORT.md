# CyberShield AI — ML/AI Architecture Audit & Implementation Report

**Author / Project:** CyberShield AI  
**Date:** August 2026  
**Document Version:** 1.0  
**Scope:** Comprehensive Technical Audit of ML/AI Subsystems, Dataset Evaluation, and Supervised Attack Classification Roadmap

---

## Executive Summary

The stated project vision for **CyberShield AI** is:

> *"Our ML service analyzes uploaded security logs, detects abnormalities, maps known abnormal behaviour to an existing attack type, and warns when the behaviour does not match known attacks."*

This document provides a line-by-line codebase audit of the existing implementation, outlines what is genuine machine learning versus rule-based logic, evaluates public benchmark datasets for intrusion detection, and details the target hybrid architecture required to fulfill the project's stated objectives.

---

## Section A: Current ML Pipeline Audit

### 1. End-to-End Ingestion Flow

```
User uploads log in Frontend
  │
  ▼
Frontend (`/logs/page.tsx` UploadModal) sends POST `/api/logs`
  │
  ▼
NestJS Backend (`LogsController` → `LogsService.create()`)
  ├── 1. Saves raw log document to MongoDB (`security_logs` collection)
  └── 2. Enqueues background job to BullMQ queue `log-processing` ({ logId })
  │
  ▼
BullMQ Worker (`LogsProcessor.process()` in `backend/src/jobs/logs.processor.ts`)
  ├── 1. Fetches log from MongoDB by `logId`
  ├── 2. Sends HTTP POST to `http://localhost:8000/api/v1/detect`
  │       │
  │       ▼
  │   FastAPI ML Service (`ml-service/app/main.py`)
  │     ├── `extract_features(logs)` → Transforms log into an (1, 8) float64 array
  │     ├── `AnomalyDetector.predict()` → Scales features via `StandardScaler`, passes to
  │     │   `IsolationForest` + `OneClassSVM` ensemble, inverts decision scores → `anomaly_score` (0.0 to 1.0)
  │     ├── `ThreatScorer.score()` → Computes composite threat score (0 to 100) using weighted formula
  │     └── `ThreatExplainer.explain()` → Tries SHAP `TreeExplainer` on Isolation Forest, falls back to heuristics
  │     └── Returns JSON `{ anomaly_score, threat_score, category, reasons }`
  │
  ├── 3. Updates MongoDB log record with `anomalyScore`, `threatScore`, `isProcessed: true`, `metadata.reasons`
  └── 4. If `threatScore >= 60`:
          ├── Runs static dictionary lookup `mapEventTypeToAlertType(log.eventType)`
          ├── Maps `threatScore` to Severity enum (`CRITICAL`, `HIGH`, `MEDIUM`)
          └── Writes new `Alert` record to PostgreSQL via Prisma
  │
  ▼
Frontend Alerts Page (`/alerts/page.tsx`)
  └── Polls/Fetches `GET /api/alerts` from PostgreSQL to render alert cards and threat badges
```

### 2. Genuine Machine Learning Components

1. **Isolation Forest (`sklearn.ensemble.IsolationForest`)**: Unsupervised tree-based anomaly detector measuring how isolated a data point is in feature space.
2. **One-Class SVM (`sklearn.svm.OneClassSVM`)**: Unsupervised kernel-based support vector boundary estimation (`kernel='rbf'`).
3. **Standard Feature Scaler (`sklearn.preprocessing.StandardScaler`)**: Z-score normalization for numerical feature scaling.
4. **SHAP TreeExplainer (`shap.TreeExplainer`)**: Feature attribution framework calculating Shapley values on the Isolation Forest trees (with deterministic heuristic fallback).

### 3. Rule-Based & Heuristic Components

1. **Attack Type Classification**: Hardcoded TypeScript dictionary in `backend/src/jobs/logs.processor.ts:216-230`.
2. **Composite Threat Scoring**: Hardcoded linear weighting formula in `ml-service/app/services/threat_scorer.py`:
   $$\text{Threat Score} = (35 \times \text{Anomaly}) + (20 \times \text{IsLoginFailure}) + (15 \times \text{CountryRisk}) + (15 \times \text{PortRisk}) + (15 \times \text{Severity})$$
3. **Attack Forecasting / Predictor**: Rule-based statistical threshold checks in `ml-service/app/services/predictor.py` (e.g. checking if `failed_logins >= 20` or if `off_hours == True`).
4. **Alert Trigger Threshold**: Static conditional check `if (threatScore >= 60)` in `backend/src/jobs/logs.processor.ts:141`.

### 4. Training Data & Artefacts

* **Training Process**: In `ml-service/app/main.py:74-85`, if no saved model is detected on startup, the service invokes `generate_synthetic_normal_data(n=2000)` from `ml-service/app/utils/preprocessing.py:179-231`. This synthesizes 2,000 baseline logs using Python's pseudo-random generator `random.Random(42)` (80% day hours, HTTP/HTTPS ports, safe countries) and executes `.fit(X)`.
* **Model Artefacts**: Saved under `ml-service/models/`:
  * `isolation_forest.joblib`
  * `ocsvm.joblib`
  * `scaler.joblib`
  * `model_meta.joblib`
* **Inference Loading**: Loaded into memory upon FastAPI startup via `joblib.load()` and executed during `POST /api/v1/detect`.

---

## Section B: Attack Classification Audit

### 1. Supervised Attack Classifier Status
* **Status**: **Not Implemented in Current Codebase**.
* There is no multi-class classification model, no classifier weights file, and no probability distribution over attack classes.

### 2. Proof of Current Implementation
Attack classification is executed via string matching in `backend/src/jobs/logs.processor.ts`:

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

### 3. Supported Attack Types
Defined in Prisma schema (`backend/prisma/schema.prisma:23-32`) and Frontend types (`frontend/src/types/index.ts:66`):
1. `BRUTE_FORCE` (Authentication Brute Force)
2. `SUSPICIOUS_LOGIN` (Suspicious / Anomalous Login)
3. `PORT_SCAN` (Port Scanning / Network Reconnaissance)
4. `DDOS` (Distributed Denial of Service)
5. `MALWARE` (Malware Activity)
6. `CREDENTIAL_STUFFING` (Automated Credential Stuffing)
7. `INSIDER_THREAT` (Privilege Abuse / Data Exfiltration)
8. `UNAUTHORIZED_ACCESS` (Access Violation)

### 4. Label Leakage Analysis
* In the current upload workflow, the client/user provides the diagnosis inside the JSON payload under `"eventType"`.
* The ingestion pipeline reads `"eventType"`, extracts feature `is_login_failure` from it, maps `eventType` directly to `AlertType`, and displays it as the "detected attack type".
* **Implication**: The system does not currently deduce the attack type from low-level network telemetry (ports, protocols, bytes, packets).

---

## Section C: Feature Extraction & Compatibility

### Extracted Feature Matrix (`ml-service/app/utils/preprocessing.py`)

| Index | Feature Name | Type | Formula / Logic | Extraction Code | DB Storage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | `hour` | `float64` (0–23) | Parses timestamp string (`YYYY-MM-DDTHH:MM:SS`). Defaults to 12 on error. | `preprocessing.py:75-98` | `timestamp` in Mongo & Postgres |
| **1** | `is_login_failure` | `float64` (0.0 or 1.0) | Returns 1.0 if `"LOGIN_FAILURE"` or `"FAILURE"` in `log.eventType`. | `preprocessing.py:140-144` | `eventType` in Mongo |
| **2** | `protocol_risk` | `float64` (0.1–0.8) | Lookup: `SSH: 0.7`, `FTP: 0.8`, `SMTP: 0.5`, `DNS: 0.3`, `HTTP: 0.2`, `HTTPS: 0.1`, `TCP: 0.4`, `UDP: 0.5`. Default: 0.5. | `preprocessing.py:21-30` | `protocol` in Mongo |
| **3** | `source_weight` | `float64` (0.3–0.8) | Lookup: `IDS: 0.8`, `ANTIVIRUS: 0.7`, `FIREWALL: 0.6`, `SERVER: 0.5`, `NETWORK: 0.5`, `APPLICATION: 0.4`, `CLOUD: 0.3`. Default: 0.4. | `preprocessing.py:32-40` | `source` in Mongo |
| **4** | `country_risk` | `float64` (0.1, 0.3, 1.0) | Returns 1.0 if country in `['RU', 'CN', 'KP', 'IR', 'NG']`, 0.3 if empty, 0.1 otherwise. | `preprocessing.py:111-118` | `country` in Mongo |
| **5** | `severity_level` | `float64` (1.0–4.0) | Maps `LOW: 1`, `MEDIUM: 2`, `HIGH: 3`, `CRITICAL: 4`. Default: 2. | `preprocessing.py:42-47` | `severity` in Mongo & Postgres |
| **6** | `port_risk` | `float64` (0.1–0.9) | Lookup: `22: 0.7`, `23: 0.9`, `25: 0.5`, `53: 0.3`, `80: 0.2`, `443: 0.1`, `3389: 0.8`. For ports $>1024$: $\max(0.1, 0.5 - \frac{\text{port}-1024}{65535})$. Others: 0.4. | `preprocessing.py:49-61` | `destinationPort` in Mongo |
| **7** | `action_type` | `float64` (0.0–0.9) | Maps `ALLOW: 0.0`, `DENY: 0.6`, `DROP: 0.7`, `ALERT: 0.8`, `BLOCK: 0.9`. Default: 0.5. | `preprocessing.py:63-69` | `action` in Mongo |

---

## Section D: Dataset Evaluation & Benchmark Selection

### 1. Benchmark Comparison: CIC-IDS2017 vs UNSW-NB15

| Evaluation Dimension | CIC-IDS2017 (Canadian Institute for Cybersecurity) | UNSW-NB15 (Australian Centre for Cyber Security) |
| :--- | :--- | :--- |
| **Traffic Environment** | Enterprise Network Flows & Web Application Attacks | Synthetic Modern Hybrid Threats & Low-Level Exploits |
| **Attack Taxonomy** | DoS, DDoS, PortScan, FTP/SSH Brute Force, Web Attack, Infiltration, Botnet | Fuzzers, Analysis, Backdoors, DoS, Exploits, Generic, Reconnaissance, Shellcode, Worms |
| **Alignment with CyberShield** | **90% direct alignment** with application AlertTypes | ~60% alignment (heavy on low-level shellcode/fuzzers) |
| **Recommendation** | **STRONGLY RECOMMENDED** | Alternative benchmark |

### 2. Attack Category Mapping (CIC-IDS2017 $\rightarrow$ CyberShield)

| CIC-IDS2017 Attack Class | CyberShield `AlertType` | Feasibility |
| :--- | :--- | :--- |
| `SSH-Patator`, `FTP-Patator` | `BRUTE_FORCE` | Direct 1:1 Match |
| `PortScan` | `PORT_SCAN` | Direct 1:1 Match |
| `DDoS`, `DoS Slowloris`, `DoS Hulk`, `DoS GoldenEye` | `DDOS` | Direct 1:1 Match |
| `Web Attack – Brute Force` | `CREDENTIAL_STUFFING` / `BRUTE_FORCE` | Direct 1:1 Match |
| `Web Attack – SQL Injection / XSS` | `UNAUTHORIZED_ACCESS` | Direct 1:1 Match |
| `Bot`, `Infiltration` | `MALWARE` | Direct 1:1 Match |
| `BENIGN` | `BENIGN / NORMAL` | Baseline Class |

### 3. Unrepresented Categories & Mitigations
* `INSIDER_THREAT` and `SUSPICIOUS_LOGIN` require host-level audit logs or geo-velocity data, which are not present in network flow captures.
* **Mitigation**: Retain behavioral rule flags for these two categories while using the ML classifier for network-originating attack vectors.

### 4. Training Strategy
* **Data Volume**: The full CIC-IDS2017 dataset comprises ~2.8 million records (~3 GB).
* **Recommended Approach**: Extract a balanced, stratified subset of **50,000 to 100,000 samples** (e.g. 10,000 Benign, 10,000 DDoS, 10,000 PortScan, 10,000 Brute Force, 5,000 Web Attack, 5,000 Botnet).
* **Benefits**: Sub-10-second training time, model file size $<5\text{ MB}$, and high test accuracy ($>98\%$).

---

## Section E: Supervised Classifier Model Selection

### Model Trade-Off Analysis

| Metric | Random Forest Classifier | Gradient Boosting (XGBoost / LightGBM) | Multi-Layer Perceptron (Neural Net) |
| :--- | :--- | :--- | :--- |
| **Training Latency (50k rows)** | Fast (~3–5 seconds) | Fast (~5–8 seconds) | Moderate (~30–60 seconds) |
| **Explainability (SHAP)** | **Native TreeSHAP & Feature Importances** | Native TreeSHAP | Black-box KernelSHAP |
| **Hyperparameter Tuning** | Minimal (robust defaults) | Moderate (learning rate, depth) | High (layers, activations, epochs) |
| **Model Size** | Lightweight (~2–5 MB) | Lightweight (~1–3 MB) | Moderate (~10–20 MB) |
| **Academic Defensibility** | High (Clear ensemble decision trees) | High (Gradient-boosted decision trees) | High, but harder to inspect |

### Recommendation: **Random Forest Classifier (`sklearn.ensemble.RandomForestClassifier`)**

**Rationale:**
1. **Architectural Cohesion**: Matches the existing `IsolationForest` implementation.
2. **Confidence Calibration**: Provides reliable `predict_proba()` outputs necessary for zero-day / unknown attack thresholding.
3. **Academic Evaluation**: Generates a standard Confusion Matrix, Precision-Recall curves, and F1-scores for report documentation.

---

## Section F: Final Target Architecture

```
                      Uploaded Security Log (Single / Bulk JSON)
                                         │
                                         ▼
                     Unified Feature Extractor (`preprocessing.py`)
                     (Transforms log into standardized numeric vector)
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
                   ▼                                           ▼
         [Unsupervised Anomaly Model]               [Supervised Attack Classifier]
          Isolation Forest + One-Class SVM              Random Forest Classifier
                   │                                           │
                   ▼                                           ▼
             Anomaly Score                               Predicted Class
             (0.0 to 1.0)                                + Confidence (0.0 to 1.0)
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         │
                                         ▼
                     Threat Scorer & Decision Engine (`threat_scorer.py`)
                                         │
       ┌─────────────────────────────────┼─────────────────────────────────┐
       │                                 │                                 │
       ▼                                 ▼                                 ▼
[Normal Traffic]              [Known Attack Alert]            [Zero-Day / Unknown Warning]
• Low Anomaly (<0.5)          • High Anomaly (≥0.5)           • High Anomaly (≥0.5)
• High Normal Conf            • High Classifier Conf (≥0.65)  • Low Classifier Conf (<0.65)
• No Alert Created            • AlertType = Classifier Output • AlertType = 'SUSPICIOUS_LOGIN'
                              • Alert Title: "[Attack] detected" • Alert Title: "Unknown Anomaly Alert"
                                         │
                                         ▼
                 Stored in PostgreSQL & Displayed on Alerts Page / Dashboard
```

---

## Section G: Open-Set Recognition & Unknown Attack Detection

### The Dual-Engine Decision Matrix

To deliver on the claim: *"warns when the behaviour does not match known attacks"*, the system combines the unsupervised anomaly score ($A \in [0, 1]$) with the supervised classifier confidence ($C = \max(\vec{p}) \in [0, 1]$):

$$\text{Decision} = \begin{cases} 
\text{BENIGN (No Alert)}, & A < 0.50 \\
\text{KNOWN ATTACK ALERT (e.g. PORT\_SCAN)}, & A \ge 0.50 \land C \ge 0.65 \\
\text{UNKNOWN / NOVEL ATTACK WARNING}, & A \ge 0.50 \land C < 0.65 
\end{cases}$$

1. **Known Attack**: Event is anomalous relative to baseline and firmly matches a trained attack profile (e.g. SYN scan pattern).
2. **Novel / Zero-Day Attack**: Event is severely anomalous relative to baseline, but the supervised classifier cannot confidently assign it to any known attack class. The system flags this as a **Potential Zero-Day / Unclassified Threat**.
3. **Benign Activity**: Normal background operations.

---

## Section H: Step-by-Step Implementation Plan

```
Step 1: Dataset Acquisition & Stratified Sampling
├── Acquire CIC-IDS2017 capture CSVs.
├── Write offline utility: `ml-service/scripts/train_classifier.py`.
└── Sample 50,000 balanced records (Benign, DDoS, PortScan, BruteForce, WebAttack, Bot).

Step 2: Feature Alignment & Preprocessing
├── Filter missing/infinite values.
├── Select standard 10–12 features matching the log model.
└── Fit `StandardScaler` and `LabelEncoder`.

Step 3: Supervised Model Training & Metric Generation
├── Train `RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)`.
├── Generate Classification Report & Confusion Matrix figures.
└── Persist to `ml-service/models/attack_classifier.joblib` and `label_encoder.joblib`.

Step 4: Update ML Service Engine
├── Create `ml-service/app/services/attack_classifier.py`
│   └── Implement `AttackClassifier` with `predict()` returning `(predicted_class, confidence, probabilities)`.
├── Update `ml-service/app/main.py`
│   └── Enhance `/api/v1/detect` to invoke both `AnomalyDetector` and `AttackClassifier`.
└── Update `ml-service/app/schemas/models.py`
    └── Add `predicted_attack`, `classifier_confidence`, and `is_unknown_attack` to `DetectResult`.

Step 5: Update Backend Worker
├── Modify `backend/src/jobs/logs.processor.ts`
│   └── Replace static `mapEventTypeToAlertType()` with the ML-predicted attack classification.
└── If `is_unknown_attack === true`, set alert title to `"Novel / Unclassified Threat Detected"`.

Step 6: End-to-End Verification
├── Ingest known attack sample logs → verify accurate ML classification.
├── Ingest novel anomaly sample logs → verify unknown attack warning trigger.
└── Verify live alerts render seamlessly on the Next.js frontend without API contract breakage.
```

---

## Technical Audit Verdict

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              CURRENT SYSTEM STATUS                             │
├────────────────────────────────────────────────────────────────────────────────┤
│ • Genuine ML:             Unsupervised Anomaly Detection (Isolation Forest     │
│                           + One-Class SVM + StandardScaler + SHAP)             │
│ • Rule-Based / Seeded:    Attack Type mapping in worker, threat scoring formula│
│ • Missing Component:      Supervised multi-class attack classifier + dataset   │
│ • Recommended Dataset:    CIC-IDS2017 (50k stratified sample)                  │
│ • Recommended Classifier: Random Forest Classifier (n_estimators=100)          │
│ • Implementation Effort:  Low to Moderate (~1 script, ~3 updated files)        │
│ • Target Architecture:    Hybrid Open-Set Recognition (100% matches project    │
│                           definition)                                          │
└────────────────────────────────────────────────────────────────────────────────┘
```
