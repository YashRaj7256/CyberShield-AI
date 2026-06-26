"""
Feature extraction & synthetic-data generation for the anomaly-detection pipeline.

Each log entry is converted into an 8-dimensional numeric feature vector that
captures temporal, geographic, protocol, and behavioural risk signals.
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone
from typing import Sequence

import numpy as np

from app.config import settings
from app.schemas.models import LogEntry

# ── Lookup tables ──────────────────────────────────────────────────────────

PROTOCOL_RISK: dict[str, float] = {
    "SSH": 0.7,
    "FTP": 0.8,
    "SMTP": 0.5,
    "DNS": 0.3,
    "HTTP": 0.2,
    "HTTPS": 0.1,
    "TCP": 0.4,
    "UDP": 0.5,
}

SOURCE_WEIGHT: dict[str, float] = {
    "IDS": 0.8,
    "FIREWALL": 0.6,
    "ANTIVIRUS": 0.7,
    "SERVER": 0.5,
    "APPLICATION": 0.4,
    "CLOUD": 0.3,
    "NETWORK": 0.5,
}

SEVERITY_MAP: dict[str, int] = {
    "LOW": 1,
    "MEDIUM": 2,
    "HIGH": 3,
    "CRITICAL": 4,
}

PORT_RISK: dict[int, float] = {
    22: 0.7,    # SSH
    23: 0.9,    # Telnet
    25: 0.5,    # SMTP
    53: 0.3,    # DNS
    80: 0.2,    # HTTP
    443: 0.1,   # HTTPS
    3306: 0.6,  # MySQL
    3389: 0.8,  # RDP
    5432: 0.6,  # PostgreSQL
    8080: 0.3,  # HTTP-alt
    8443: 0.2,  # HTTPS-alt
}

ACTION_MAP: dict[str, float] = {
    "ALLOW": 0.0,
    "DENY": 0.6,
    "DROP": 0.7,
    "ALERT": 0.8,
    "BLOCK": 0.9,
}


# ── Helpers ────────────────────────────────────────────────────────────────


def _parse_hour(timestamp: str) -> int:
    """Extract hour-of-day from an ISO-8601 timestamp string.

    Handles common formats gracefully; defaults to 12 on parse failure.
    """
    for fmt in (
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
    ):
        try:
            return datetime.strptime(timestamp, fmt).hour
        except ValueError:
            continue
    # Last-resort: try fromisoformat (Python 3.11+)
    try:
        return datetime.fromisoformat(timestamp).hour
    except Exception:
        return 12  # safe default


def _port_risk(port: int) -> float:
    """Return a risk weight for a destination port."""
    if port in PORT_RISK:
        return PORT_RISK[port]
    # High ports (ephemeral) are generally lower risk
    if port > 1024:
        return max(0.1, 0.5 - (port - 1024) / 65535)
    # Well-known ports not in our map
    return 0.4


def _country_risk(country: str | None) -> float:
    """Return a risk weight for the source country."""
    if country is None or country.strip() == "":
        return 0.3  # unknown
    if country.strip().upper() in settings.HIGH_RISK_COUNTRIES:
        return 1.0
    return 0.1  # safe country


# ── Public API ─────────────────────────────────────────────────────────────


def extract_features(logs: Sequence[LogEntry]) -> np.ndarray:
    """Convert a sequence of *LogEntry* objects into an (N, 8) feature matrix.

    Feature order matches ``settings.FEATURE_NAMES``:
        0. hour            — hour of day (0-23)
        1. is_login_failure — binary flag
        2. protocol_risk   — protocol risk weight
        3. source_weight   — log-source weight
        4. country_risk    — geographic risk weight
        5. severity_level  — ordinal 1-4
        6. port_risk       — destination-port risk weight
        7. action_type     — action risk weight
    """
    rows: list[list[float]] = []
    for log in logs:
        hour = float(_parse_hour(log.timestamp))

        is_login_failure = 1.0 if any(
            kw in (log.eventType or "").upper()
            for kw in ("LOGIN_FAILURE", "FAILURE")
        ) else 0.0

        protocol_risk = PROTOCOL_RISK.get(
            (log.protocol or "").upper(), 0.5
        )

        source_weight = SOURCE_WEIGHT.get(
            (log.source or "").upper(), 0.4
        )

        country_risk = _country_risk(log.country)

        severity_level = float(
            SEVERITY_MAP.get((log.severity or "").upper(), 2)
        )

        port_risk = _port_risk(log.destinationPort)

        action_type = ACTION_MAP.get(
            (log.action or "").upper(), 0.5
        )

        rows.append([
            hour,
            is_login_failure,
            protocol_risk,
            source_weight,
            country_risk,
            severity_level,
            port_risk,
            action_type,
        ])

    return np.array(rows, dtype=np.float64)


def generate_synthetic_normal_data(n: int = 2000) -> list[LogEntry]:
    """Generate *n* synthetic **normal-behaviour** log entries.

    The generated data represents a typical enterprise baseline:
    - Business-hour activity (7 AM – 20 PM bias)
    - Common safe protocols (HTTPS, HTTP, DNS)
    - Safe countries (US, GB, DE, FR, JP, AU, CA)
    - Mostly ALLOW actions
    - LOW / MEDIUM severity
    """
    rng = random.Random(settings.RANDOM_STATE)
    base_time = datetime(2026, 1, 1, 8, 0, 0, tzinfo=timezone.utc)

    safe_countries = ["US", "GB", "DE", "FR", "JP", "AU", "CA", "NL", "SE", "NO"]
    normal_protocols = ["HTTPS", "HTTP", "DNS", "TCP", "UDP"]
    normal_sources = ["FIREWALL", "SERVER", "APPLICATION", "CLOUD", "NETWORK"]
    normal_event_types = [
        "CONNECTION", "DNS_QUERY", "HTTP_REQUEST",
        "LOGIN_SUCCESS", "SESSION_START", "DATA_TRANSFER",
        "HEALTH_CHECK", "API_CALL",
    ]
    normal_actions = ["ALLOW", "ALLOW", "ALLOW", "ALLOW", "DENY"]  # 80 % ALLOW
    normal_severities = ["LOW", "LOW", "LOW", "MEDIUM", "MEDIUM"]
    normal_ports = [80, 443, 443, 443, 53, 8080, 8443]

    logs: list[LogEntry] = []
    for i in range(n):
        # Business-hour bias: 80 % chance of 7-20, 20 % chance of night hours
        if rng.random() < 0.8:
            hour = rng.randint(7, 20)
        else:
            hour = rng.choice(list(range(0, 7)) + list(range(21, 24)))

        ts = base_time + timedelta(hours=hour, minutes=rng.randint(0, 59),
                                   seconds=rng.randint(0, 59), days=i % 365)

        logs.append(LogEntry(
            timestamp=ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
            sourceIp=f"10.0.{rng.randint(1, 254)}.{rng.randint(1, 254)}",
            destinationIp=f"192.168.{rng.randint(1, 254)}.{rng.randint(1, 254)}",
            sourcePort=rng.randint(1024, 65535),
            destinationPort=rng.choice(normal_ports),
            protocol=rng.choice(normal_protocols),
            action=rng.choice(normal_actions),
            severity=rng.choice(normal_severities),
            source=rng.choice(normal_sources),
            eventType=rng.choice(normal_event_types),
            country=rng.choice(safe_countries),
            message="Synthetic baseline event",
        ))

    return logs
