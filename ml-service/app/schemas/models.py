"""
Pydantic request / response models for the CyberShield AI ML API.

Every model uses strict validation — incoming data is never silently coerced.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


# ── Input Models ───────────────────────────────────────────────────────────


class LogEntry(BaseModel):
    """A single network / security log event."""

    timestamp: str = Field(
        ..., description="ISO-8601 formatted timestamp of the event"
    )
    sourceIp: str = Field(..., description="Source IP address")
    destinationIp: str = Field(..., description="Destination IP address")
    sourcePort: int = Field(..., ge=0, le=65535, description="Source port")
    destinationPort: int = Field(
        ..., ge=0, le=65535, description="Destination port"
    )
    protocol: str = Field(..., description="Network protocol (TCP, UDP, …)")
    action: str = Field(
        ..., description="Firewall / IDS action (ALLOW, DENY, DROP, …)"
    )
    severity: str = Field(
        ..., description="Event severity (LOW, MEDIUM, HIGH, CRITICAL)"
    )
    source: str = Field(
        ...,
        description="Originating system (FIREWALL, IDS, ANTIVIRUS, …)",
    )
    eventType: str = Field(
        ..., description="Semantic event type (LOGIN_FAILURE, …)"
    )

    # Optional enrichment fields
    message: Optional[str] = Field(None, description="Free-text description")
    country: Optional[str] = Field(None, description="ISO-3166 country code")
    city: Optional[str] = Field(None, description="City name")
    latitude: Optional[float] = Field(None, description="Latitude")
    longitude: Optional[float] = Field(None, description="Longitude")
    userId: Optional[str] = Field(None, description="Associated user ID")
    userName: Optional[str] = Field(None, description="Associated user name")
    deviceType: Optional[str] = Field(None, description="Device type")
    browser: Optional[str] = Field(None, description="Browser identifier")
    os: Optional[str] = Field(None, description="Operating system")


# ── Request Models ─────────────────────────────────────────────────────────


class DetectRequest(BaseModel):
    """Batch anomaly-detection request."""

    logs: list[LogEntry] = Field(
        ..., min_length=1, description="One or more log entries to analyse"
    )


class TrainRequest(BaseModel):
    """Model (re)training request.

    If *logs* is empty the service will generate synthetic baseline data.
    """

    logs: list[LogEntry] = Field(
        default_factory=list,
        description="Training log entries (leave empty for synthetic data)",
    )


# ── Response Models ────────────────────────────────────────────────────────


class DetectResult(BaseModel):
    """Analysis result for a single log entry."""

    log_index: int = Field(..., description="Index of the log in the request")
    anomaly_score: float = Field(
        ..., ge=0.0, le=1.0, description="Anomaly score (0 = normal, 1 = anomalous)"
    )
    threat_score: int = Field(
        ..., ge=0, le=100, description="Composite threat score"
    )
    category: str = Field(
        ...,
        description="Risk category: SAFE | LOW_RISK | MEDIUM_RISK | HIGH_RISK | CRITICAL",
    )
    reasons: list[str] = Field(
        ..., description="Human-readable SHAP / heuristic explanations"
    )
    is_anomaly: bool = Field(
        ..., description="Whether the log is considered anomalous"
    )


class DetectResponse(BaseModel):
    """Batch anomaly-detection response."""

    results: list[DetectResult]
    model_used: str = Field(
        ..., description="Identifier of the model ensemble used"
    )
    processing_time_ms: float = Field(
        ..., description="Total processing time in milliseconds"
    )


class TrainResponse(BaseModel):
    """Model training response."""

    status: str
    samples_used: int
    model_metrics: dict


class HealthResponse(BaseModel):
    """Service health check response."""

    status: str
    models_loaded: bool
    model_info: dict
