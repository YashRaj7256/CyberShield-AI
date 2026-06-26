"""
SHAP-based (with heuristic fallback) threat explanation engine.

Provides human-readable strings that tell the analyst *why* a particular log
entry was flagged, attributing risk to specific features.
"""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np

from app.config import settings
from app.schemas.models import LogEntry
from app.services.anomaly_detector import AnomalyDetector

logger = logging.getLogger(__name__)

# ── Country code → display name (subset for readable explanations) ─────────

_COUNTRY_NAMES: dict[str, str] = {
    "RU": "Russia",
    "CN": "China",
    "KP": "North Korea",
    "IR": "Iran",
    "NG": "Nigeria",
}

# ── Port → service name ───────────────────────────────────────────────────

_PORT_SERVICE: dict[int, str] = {
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    443: "HTTPS",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    8080: "HTTP-alt",
    8443: "HTTPS-alt",
}


class ThreatExplainer:
    """Generate human-readable explanations for threat detections.

    Tries SHAP ``TreeExplainer`` on the Isolation Forest first; if that
    fails for any reason (incompatible version, missing model, numerical
    issues) it falls back to deterministic heuristic explanations — the
    service **always** returns results.
    """

    def __init__(self, detector: AnomalyDetector) -> None:
        self._detector = detector

    # ── Public API ────────────────────────────────────────────────────

    def explain(
        self,
        log: LogEntry,
        features: np.ndarray,
        anomaly_score: float,
        threat_score: int,
    ) -> list[str]:
        """Return 3-5 human-readable explanation strings for a single log.

        Parameters
        ----------
        log : LogEntry
            Original log event.
        features : np.ndarray
            1-D feature vector for this log (8 values).
        anomaly_score : float
            Anomaly score (0-1) from the detector.
        threat_score : int
            Composite threat score (0-100).
        """
        # Attempt SHAP-based explanations first
        shap_reasons = self._try_shap(features)
        if shap_reasons:
            return shap_reasons[:5]

        # Fallback: heuristic explanations
        return self._heuristic_explanations(log, features, anomaly_score, threat_score)

    # ── SHAP path ─────────────────────────────────────────────────────

    def _try_shap(self, features: np.ndarray) -> Optional[list[str]]:
        """Attempt SHAP TreeExplainer on the Isolation Forest model."""
        if not self._detector.is_loaded or self._detector.isolation_forest is None:
            return None
        if self._detector.scaler is None:
            return None

        try:
            import shap  # lazy import – don't break if shap is missing

            feature_row = features.reshape(1, -1)
            scaled_row = self._detector.scaler.transform(feature_row)

            explainer = shap.TreeExplainer(self._detector.isolation_forest)
            shap_values = explainer.shap_values(scaled_row)

            # shap_values shape: (1, n_features)
            sv = shap_values[0]
            feature_names = settings.FEATURE_NAMES

            # Pair feature names with their SHAP values
            pairs = sorted(
                zip(feature_names, sv),
                key=lambda p: abs(p[1]),
                reverse=True,
            )

            reasons: list[str] = []
            for name, value in pairs[:5]:
                direction = "increased" if value > 0 else "decreased"
                pct = abs(value) * 100
                if pct < 0.5:
                    continue
                reasons.append(
                    f"Feature '{name}' {direction} anomaly score "
                    f"by {pct:.1f}%"
                )

            if reasons:
                return reasons

        except Exception:
            logger.debug("SHAP explanation failed; falling back to heuristics", exc_info=True)

        return None

    # ── Heuristic fallback ────────────────────────────────────────────

    def _heuristic_explanations(
        self,
        log: LogEntry,
        features: np.ndarray,
        anomaly_score: float,
        threat_score: int,
    ) -> list[str]:
        """Generate deterministic explanations based on feature analysis."""
        reasons: list[str] = []

        # 1. Country risk
        country_upper = (log.country or "").strip().upper()
        if country_upper in settings.HIGH_RISK_COUNTRIES:
            name = _COUNTRY_NAMES.get(country_upper, country_upper)
            reasons.append(
                f"Login attempt from high-risk country ({name}) "
                f"— contributed +15% to risk score"
            )

        # 2. Login failure
        event_upper = (log.eventType or "").upper()
        if "LOGIN_FAILURE" in event_upper or "FAILURE" in event_upper:
            reasons.append(
                "Failed login event detected — contributed +20% to risk score"
            )

        # 3. Unusual hour
        hour = int(features[0]) if len(features) > 0 else 12
        if hour < 6 or hour > 22:
            reasons.append(
                f"Activity at unusual hour ({hour}:00) "
                f"— contributed +10% to risk score"
            )

        # 4. High-risk port
        port = log.destinationPort
        port_risk_val = features[6] if len(features) > 6 else 0.0
        if port_risk_val >= 0.7:
            svc = _PORT_SERVICE.get(port, str(port))
            reasons.append(
                f"Connection on high-risk port {port} ({svc}) "
                f"— contributed +12% to risk score"
            )

        # 5. Alert / Block action from IDS
        action_upper = (log.action or "").upper()
        source_upper = (log.source or "").upper()
        if action_upper in ("ALERT", "BLOCK", "DROP"):
            src_label = f" by {source_upper}" if source_upper else ""
            reasons.append(
                f"{action_upper} action triggered{src_label} "
                f"— contributed +8% to risk score"
            )

        # 6. High severity
        severity_upper = (log.severity or "").upper()
        if severity_upper in ("HIGH", "CRITICAL"):
            reasons.append(
                f"Severity level is {severity_upper} "
                f"— contributed +{10 if severity_upper == 'HIGH' else 15}% to risk score"
            )

        # 7. High anomaly score
        if anomaly_score >= 0.7:
            reasons.append(
                f"ML anomaly score is elevated ({anomaly_score:.2f}) "
                f"— contributed +{int(anomaly_score * 35)}% to risk score"
            )

        # 8. Risky protocol
        proto_upper = (log.protocol or "").upper()
        if proto_upper in ("SSH", "FTP", "SMTP"):
            reasons.append(
                f"Protocol {proto_upper} has elevated risk weight "
                f"— contributed +5% to risk score"
            )

        # Ensure at least one reason is returned
        if not reasons:
            reasons.append(
                f"Composite threat score is {threat_score}/100 "
                f"(anomaly={anomaly_score:.2f})"
            )

        # Cap at 5
        return reasons[:5]
