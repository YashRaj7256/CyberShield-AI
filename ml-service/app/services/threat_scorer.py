"""
Weighted threat scorer that combines ML anomaly scores with rule-based signals.

The final threat score is an integer in [0, 100] mapped to one of five
risk categories.
"""

from __future__ import annotations

import logging

from app.config import settings
from app.schemas.models import LogEntry

logger = logging.getLogger(__name__)

# ── Category thresholds ────────────────────────────────────────────────────

CATEGORY_THRESHOLDS: list[tuple[int, str]] = [
    (20, "SAFE"),
    (40, "LOW_RISK"),
    (60, "MEDIUM_RISK"),
    (80, "HIGH_RISK"),
    (100, "CRITICAL"),
]

# ── Port risk (reused from preprocessing for consistency) ──────────────────

_PORT_RISK: dict[int, float] = {
    22: 0.7, 23: 0.9, 25: 0.5, 53: 0.3, 80: 0.2,
    443: 0.1, 3306: 0.6, 3389: 0.8, 5432: 0.6,
    8080: 0.3, 8443: 0.2,
}

_SEVERITY_FACTOR: dict[str, float] = {
    "LOW": 0.1,
    "MEDIUM": 0.3,
    "HIGH": 0.7,
    "CRITICAL": 1.0,
}


def _port_risk_factor(port: int) -> float:
    if port in _PORT_RISK:
        return _PORT_RISK[port]
    if port > 1024:
        return max(0.1, 0.5 - (port - 1024) / 65535)
    return 0.4


def _country_risk_factor(country: str | None) -> float:
    if country and country.strip().upper() in settings.HIGH_RISK_COUNTRIES:
        return 1.0
    if not country or country.strip() == "":
        return 0.3
    return 0.1


class ThreatScorer:
    """Compute a composite threat score in [0, 100].

    Weighting breakdown (sums to 100):
        - anomaly_score weight   : 35
        - failed_login_factor    : 20
        - country_risk           : 15
        - port_risk_factor       : 15
        - severity_factor        : 15
    """

    # ── Weight constants ──────────────────────────────────────────────

    W_ANOMALY: float = 35.0
    W_LOGIN: float = 20.0
    W_COUNTRY: float = 15.0
    W_PORT: float = 15.0
    W_SEVERITY: float = 15.0

    def score(
        self, log: LogEntry, anomaly_score: float
    ) -> tuple[int, str]:
        """Return ``(threat_score, category)`` for a single log entry.

        Parameters
        ----------
        log : LogEntry
            The original log event.
        anomaly_score : float
            Anomaly score from :class:`AnomalyDetector` (0-1).
        """
        # 1. Anomaly component (already 0-1)
        anomaly_component = anomaly_score * self.W_ANOMALY

        # 2. Failed-login component
        event_upper = (log.eventType or "").upper()
        is_failure = 1.0 if ("LOGIN_FAILURE" in event_upper or "FAILURE" in event_upper) else 0.0
        login_component = is_failure * self.W_LOGIN

        # 3. Country-risk component
        country_component = _country_risk_factor(log.country) * self.W_COUNTRY

        # 4. Port-risk component
        port_component = _port_risk_factor(log.destinationPort) * self.W_PORT

        # 5. Severity component
        sev_factor = _SEVERITY_FACTOR.get((log.severity or "").upper(), 0.3)
        severity_component = sev_factor * self.W_SEVERITY

        raw = (
            anomaly_component
            + login_component
            + country_component
            + port_component
            + severity_component
        )

        threat_score = int(min(100, max(0, round(raw))))
        category = self._categorise(threat_score)
        return threat_score, category

    # ── Private helpers ───────────────────────────────────────────────

    @staticmethod
    def _categorise(score: int) -> str:
        for threshold, label in CATEGORY_THRESHOLDS:
            if score <= threshold:
                return label
        return "CRITICAL"
