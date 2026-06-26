"""
CyberShield AI — ML Service
============================

FastAPI application that exposes anomaly-detection, threat-scoring, and
explainability endpoints for the Cyber Threat Intelligence Platform.

Run locally with:

    uvicorn app.main:app --reload

"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas.models import (
    DetectRequest,
    DetectResponse,
    DetectResult,
    HealthResponse,
    TrainRequest,
    TrainResponse,
)
from app.services.anomaly_detector import AnomalyDetector
from app.services.explainer import ThreatExplainer
from app.services.threat_scorer import ThreatScorer
from app.utils.preprocessing import extract_features, generate_synthetic_normal_data

# ── Logging ────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("cybershield.ml")

# ── Global service instances ───────────────────────────────────────────────

detector: AnomalyDetector
scorer: ThreatScorer
explainer: ThreatExplainer


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Initialise ML components on startup."""
    global detector, scorer, explainer

    settings.ensure_dirs()

    logger.info("Initialising ML components …")
    detector = AnomalyDetector()
    scorer = ThreatScorer()
    explainer = ThreatExplainer(detector)

    if not detector.is_loaded:
        logger.info(
            "No saved models found — auto-training on %d synthetic samples …",
            settings.SYNTHETIC_SAMPLE_COUNT,
        )
        synthetic_logs = generate_synthetic_normal_data(
            n=settings.SYNTHETIC_SAMPLE_COUNT
        )
        features = extract_features(synthetic_logs)
        detector.train(features)
        logger.info("Auto-training complete.")

    logger.info("CyberShield AI ML Service ready ✓")
    yield
    logger.info("Shutting down ML service …")


# ── Application factory ───────────────────────────────────────────────────

app = FastAPI(
    title="CyberShield AI — ML Service",
    description=(
        "Real-time anomaly detection, threat scoring, and explainability "
        "for the Cyber Threat Intelligence Platform."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow everything in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request-timing middleware ──────────────────────────────────────────────


@app.middleware("http")
async def timing_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Process-Time-Ms"] = f"{elapsed_ms:.2f}"
    logger.info(
        "%s %s — %.2f ms",
        request.method,
        request.url.path,
        elapsed_ms,
    )
    return response


# ── Global exception handler ──────────────────────────────────────────────


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Check logs for details."},
    )


# ── Routes ─────────────────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
async def health_check() -> HealthResponse:
    """Return service health and model information."""
    return HealthResponse(
        status="healthy" if detector.is_loaded else "degraded",
        models_loaded=detector.is_loaded,
        model_info=detector.meta if detector.is_loaded else {},
    )


@app.post("/api/v1/detect", response_model=DetectResponse, tags=["Detection"])
async def detect_anomalies(request: DetectRequest) -> DetectResponse:
    """Analyse a batch of log entries for anomalies and threats.

    Each log is passed through the full pipeline:
    1. Feature extraction
    2. Anomaly scoring (Isolation Forest + One-Class SVM ensemble)
    3. Weighted threat scoring
    4. SHAP / heuristic explanation
    """
    start = time.perf_counter()

    if not detector.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. POST to /api/v1/train first.",
        )

    logs = request.logs

    try:
        features = extract_features(logs)
        anomaly_scores = detector.predict(features)
    except Exception as exc:
        logger.exception("Feature extraction / anomaly detection failed")
        raise HTTPException(
            status_code=500,
            detail=f"ML pipeline error: {exc}",
        ) from exc

    results: list[DetectResult] = []
    for idx, (log, score_val) in enumerate(zip(logs, anomaly_scores)):
        a_score = float(score_val)

        # Threat scoring
        try:
            threat_score, category = scorer.score(log, a_score)
        except Exception:
            logger.warning("Threat scoring failed for log %d; defaulting", idx)
            threat_score, category = 0, "SAFE"

        # Explanation
        try:
            feature_row = features[idx]
            reasons = explainer.explain(log, feature_row, a_score, threat_score)
        except Exception:
            logger.warning("Explanation failed for log %d; using fallback", idx)
            reasons = [
                f"Anomaly score: {a_score:.2f}, Threat score: {threat_score}/100"
            ]

        is_anomaly = threat_score >= settings.THREAT_THRESHOLD

        results.append(
            DetectResult(
                log_index=idx,
                anomaly_score=round(a_score, 4),
                threat_score=threat_score,
                category=category,
                reasons=reasons,
                is_anomaly=is_anomaly,
            )
        )

    elapsed_ms = (time.perf_counter() - start) * 1000

    return DetectResponse(
        results=results,
        model_used="IsolationForest+OneClassSVM_v1",
        processing_time_ms=round(elapsed_ms, 2),
    )


@app.post("/api/v1/train", response_model=TrainResponse, tags=["Training"])
async def train_models(request: TrainRequest) -> TrainResponse:
    """Train (or retrain) the anomaly-detection models.

    If the request body contains log entries they are used as training data;
    otherwise synthetic normal-baseline data is generated automatically.
    """
    if request.logs:
        logs = request.logs
        source = "user-provided"
    else:
        logs = generate_synthetic_normal_data(n=settings.SYNTHETIC_SAMPLE_COUNT)
        source = "synthetic"

    logger.info(
        "Training requested with %d %s samples",
        len(logs),
        source,
    )

    try:
        features = extract_features(logs)
        metrics = detector.train(features)
    except Exception as exc:
        logger.exception("Training failed")
        raise HTTPException(
            status_code=500,
            detail=f"Training error: {exc}",
        ) from exc

    # Re-initialise explainer with the freshly trained detector
    global explainer
    explainer = ThreatExplainer(detector)

    return TrainResponse(
        status="trained",
        samples_used=len(logs),
        model_metrics=metrics,
    )
