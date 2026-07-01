"""
Attack Prediction Service
=========================

Analyses recent security log patterns to predict upcoming attacks.

The predictor uses statistical heuristics over a sliding window of recent
logs to identify precursors of known attack campaigns.  Each prediction
carries a probability, confidence score, timeframe, and actionable
countermeasures suitable for a Security Operations Centre (SOC).
"""

from __future__ import annotations

import logging
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Sequence

from app.config import settings
from app.schemas.models import LogEntry, PredictionResult

logger = logging.getLogger(__name__)

# ── High-risk country set (resolved once) ──────────────────────────────────

_HIGH_RISK_COUNTRIES: set[str] = set(settings.HIGH_RISK_COUNTRIES)

# ── Recon event-type keywords ──────────────────────────────────────────────

_RECON_KEYWORDS: set[str] = {
    "PORT_SCAN", "SCAN", "PROBE", "RECONNAISSANCE", "SWEEP",
    "NMAP", "ENUM", "ENUMERATION", "DISCOVERY",
}

_MALWARE_KEYWORDS: set[str] = {
    "MALWARE", "VIRUS", "TROJAN", "RANSOMWARE", "WORM",
    "PAYLOAD", "EXPLOIT_KIT", "DROPPER", "BACKDOOR",
}

_DATA_KEYWORDS: set[str] = {
    "DATA_TRANSFER", "FILE_DOWNLOAD", "FILE_UPLOAD",
    "DATA_ACCESS", "DATABASE_QUERY", "EXPORT",
}

_PRIV_EVENT_TYPES: set[str] = {
    "PRIVILEGE_ESCALATION", "SUDO", "ADMIN_ACCESS",
    "CONFIG_CHANGE", "ROLE_CHANGE", "USER_MODIFY",
}


# ── Helpers ────────────────────────────────────────────────────────────────


def _parse_dt(timestamp: str) -> datetime:
    """Best-effort ISO-8601 parse; returns UTC-now on failure."""
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
            return datetime.strptime(timestamp, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(timestamp).replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def _is_off_hours(hour: int) -> bool:
    """Return ``True`` when *hour* falls outside 07:00 – 20:00."""
    return hour < 7 or hour > 20


def _unique_ips(logs: Sequence[LogEntry]) -> set[str]:
    """Collect unique source IPs from *logs*."""
    return {log.sourceIp for log in logs}


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


# ── Core Predictor ─────────────────────────────────────────────────────────


class AttackPredictor:
    """Stateless heuristic predictor that analyses recent logs for attack
    precursors and produces SOC-grade prediction results.

    Usage
    -----
    >>> predictor = AttackPredictor()
    >>> predictions = predictor.predict(recent_logs, window_hours=24)
    """

    def predict(
        self,
        recent_logs: list[LogEntry],
        window_hours: int = 24,
    ) -> list[PredictionResult]:
        """Analyse *recent_logs* and return 3-8 attack predictions.

        Parameters
        ----------
        recent_logs:
            A list of ``LogEntry`` objects representing recent activity.
        window_hours:
            The lookback window (hours) within which the logs were
            collected.  Used to calibrate timeframes.

        Returns
        -------
        list[PredictionResult]
            Sorted by descending probability.
        """
        if not recent_logs:
            logger.warning("predict() called with an empty log list")
            return []

        # ── Pre-compute aggregate statistics ──────────────────────────
        stats = self._compute_stats(recent_logs, window_hours)

        # ── Run each detection heuristic ──────────────────────────────
        predictions: list[PredictionResult] = []
        for heuristic in (
            self._check_brute_force,
            self._check_recon_exploit,
            self._check_geographic_anomaly,
            self._check_ddos_buildup,
            self._check_data_exfiltration,
            self._check_insider_threat,
            self._check_malware_propagation,
            self._check_zero_day,
        ):
            result = heuristic(recent_logs, stats)
            if result is not None:
                predictions.append(result)

        # Sort by probability descending
        predictions.sort(key=lambda p: p.probability, reverse=True)

        # Ensure we return between 3 and 8 predictions
        if len(predictions) < 3:
            predictions = self._pad_predictions(predictions, recent_logs, stats)
        if len(predictions) > 8:
            predictions = predictions[:8]

        logger.info(
            "Generated %d predictions from %d logs (window=%dh)",
            len(predictions),
            len(recent_logs),
            window_hours,
        )
        return predictions

    # ── Aggregate statistics ──────────────────────────────────────────

    def _compute_stats(
        self,
        logs: list[LogEntry],
        window_hours: int,
    ) -> dict:
        """Compute reusable aggregate statistics across all logs."""
        failed_logins_by_ip: Counter[str] = Counter()
        countries_seen: set[str] = set()
        high_risk_country_logs: list[LogEntry] = []
        recon_events: list[LogEntry] = []
        malware_events: list[LogEntry] = []
        data_events: list[LogEntry] = []
        priv_events: list[LogEntry] = []
        off_hours_logs: list[LogEntry] = []
        severity_counts: Counter[str] = Counter()
        action_counts: Counter[str] = Counter()
        source_ips: Counter[str] = Counter()
        dest_ips: Counter[str] = Counter()
        users_seen: set[str] = set()
        high_severity_logs: list[LogEntry] = []

        for log in logs:
            event_upper = (log.eventType or "").upper()
            severity_upper = (log.severity or "").upper()
            action_upper = (log.action or "").upper()
            country_upper = (log.country or "").strip().upper()

            # Failed logins by IP
            if "FAILURE" in event_upper or "LOGIN_FAILURE" in event_upper:
                failed_logins_by_ip[log.sourceIp] += 1

            # Countries
            if country_upper:
                countries_seen.add(country_upper)
                if country_upper in _HIGH_RISK_COUNTRIES:
                    high_risk_country_logs.append(log)

            # Event type classification
            if any(kw in event_upper for kw in _RECON_KEYWORDS):
                recon_events.append(log)
            if any(kw in event_upper for kw in _MALWARE_KEYWORDS):
                malware_events.append(log)
            if any(kw in event_upper for kw in _DATA_KEYWORDS):
                data_events.append(log)
            if any(kw in event_upper for kw in _PRIV_EVENT_TYPES):
                priv_events.append(log)

            # Off-hours
            hour = _parse_dt(log.timestamp).hour
            if _is_off_hours(hour):
                off_hours_logs.append(log)

            # Severity / action tallies
            severity_counts[severity_upper] += 1
            action_counts[action_upper] += 1
            source_ips[log.sourceIp] += 1
            dest_ips[log.destinationIp] += 1

            # High severity
            if severity_upper in ("HIGH", "CRITICAL"):
                high_severity_logs.append(log)

            # Users
            if log.userId:
                users_seen.add(log.userId)
            if log.userName:
                users_seen.add(log.userName)

        # Traffic rate (events per hour)
        events_per_hour = len(logs) / max(window_hours, 1)

        return {
            "failed_logins_by_ip": failed_logins_by_ip,
            "countries_seen": countries_seen,
            "high_risk_country_logs": high_risk_country_logs,
            "recon_events": recon_events,
            "malware_events": malware_events,
            "data_events": data_events,
            "priv_events": priv_events,
            "off_hours_logs": off_hours_logs,
            "severity_counts": severity_counts,
            "action_counts": action_counts,
            "source_ips": source_ips,
            "dest_ips": dest_ips,
            "users_seen": users_seen,
            "high_severity_logs": high_severity_logs,
            "events_per_hour": events_per_hour,
            "total_logs": len(logs),
            "window_hours": window_hours,
        }

    # ── Heuristic 1: Brute Force Escalation ───────────────────────────

    def _check_brute_force(
        self, logs: list[LogEntry], stats: dict
    ) -> PredictionResult | None:
        failed: Counter[str] = stats["failed_logins_by_ip"]
        if not failed:
            return None

        # Find the worst offender
        top_ip, top_count = failed.most_common(1)[0]
        total_failed = sum(failed.values())
        num_offenders = sum(1 for c in failed.values() if c >= 5)

        # Probability scales with the number of failures
        if top_count >= 20:
            probability = _clamp(0.70 + (top_count - 20) * 0.005)
        elif top_count >= 10:
            probability = _clamp(0.45 + (top_count - 10) * 0.025)
        elif top_count >= 5:
            probability = _clamp(0.20 + (top_count - 5) * 0.05)
        else:
            probability = _clamp(0.05 + top_count * 0.03)

        confidence = _clamp(min(probability + 0.1, 0.95))

        # Collect affected IPs
        affected_ips = [ip for ip, c in failed.most_common(5) if c >= 3]
        affected_targets = list(
            {log.destinationIp for log in logs
             if log.sourceIp in affected_ips}
        )[:5]

        severity = (
            "CRITICAL" if top_count >= 30
            else "HIGH" if top_count >= 20
            else "MEDIUM" if top_count >= 10
            else "LOW"
        )

        return PredictionResult(
            attack_type="BRUTE_FORCE_ESCALATION",
            probability=round(probability, 3),
            confidence=round(confidence, 3),
            timeframe="1-6 hours" if top_count >= 20 else "6-24 hours",
            description=(
                f"Detected {total_failed} failed login attempts from "
                f"{len(failed)} unique IPs. Top offender {top_ip} has "
                f"{top_count} failures, suggesting credential-stuffing or "
                f"brute-force activity likely to escalate to privilege "
                f"escalation."
            ),
            affected_assets=affected_ips + affected_targets,
            countermeasures=[
                f"Block or rate-limit source IP {top_ip} immediately",
                "Enable account lockout after 5 failed attempts",
                "Enforce MFA for all privileged accounts",
                "Review IAM logs for successful authentications from flagged IPs",
                "Deploy CAPTCHA on login endpoints",
            ],
            indicators=[
                f"{top_count} failed logins from {top_ip}",
                f"{total_failed} total failed login attempts",
                f"{num_offenders} IPs with ≥5 failures",
            ],
            severity=severity,
        )

    # ── Heuristic 2: Reconnaissance → Exploitation ────────────────────

    def _check_recon_exploit(
        self, logs: list[LogEntry], stats: dict
    ) -> PredictionResult | None:
        recon = stats["recon_events"]
        if not recon:
            return None

        recon_ips = {log.sourceIp for log in recon}
        recon_targets = {log.destinationIp for log in recon}
        scan_count = len(recon)

        probability = _clamp(0.30 + scan_count * 0.02)
        confidence = _clamp(0.35 + scan_count * 0.015)

        # Higher probability if the same IPs also did other suspicious things
        dual_purpose = recon_ips & set(stats["failed_logins_by_ip"].keys())
        if dual_purpose:
            probability = _clamp(probability + 0.15)
            confidence = _clamp(confidence + 0.10)

        severity = "HIGH" if scan_count >= 10 else "MEDIUM"

        return PredictionResult(
            attack_type="RECONNAISSANCE_EXPLOITATION",
            probability=round(probability, 3),
            confidence=round(confidence, 3),
            timeframe="6-24 hours",
            description=(
                f"Detected {scan_count} reconnaissance events (port scans, "
                f"probes) from {len(recon_ips)} source IPs targeting "
                f"{len(recon_targets)} hosts. Historical patterns indicate "
                f"exploitation attempts typically follow within 24 hours."
            ),
            affected_assets=list(recon_targets)[:5] + list(recon_ips)[:3],
            countermeasures=[
                "Patch all known CVEs on scanned hosts immediately",
                "Enable IDS/IPS signatures for top CVE exploits",
                "Segment scanned networks to limit lateral movement",
                "Deploy honeypots to detect exploitation attempts",
                f"Block scanning IPs: {', '.join(list(recon_ips)[:3])}",
            ],
            indicators=[
                f"{scan_count} reconnaissance events detected",
                f"{len(recon_ips)} unique scanning source IPs",
                f"Targets: {', '.join(list(recon_targets)[:3])}",
            ],
            severity=severity,
        )

    # ── Heuristic 3: Geographic Anomaly ───────────────────────────────

    def _check_geographic_anomaly(
        self, logs: list[LogEntry], stats: dict
    ) -> PredictionResult | None:
        hr_logs = stats["high_risk_country_logs"]
        countries = stats["countries_seen"]
        high_risk_countries = countries & _HIGH_RISK_COUNTRIES

        if not high_risk_countries:
            return None

        hr_ratio = len(hr_logs) / max(stats["total_logs"], 1)
        num_hr_countries = len(high_risk_countries)

        probability = _clamp(0.20 + hr_ratio * 0.5 + num_hr_countries * 0.08)
        confidence = _clamp(0.25 + hr_ratio * 0.4 + num_hr_countries * 0.06)

        affected_users = list(
            {log.userId or log.userName or log.sourceIp for log in hr_logs}
        )[:5]

        severity = (
            "CRITICAL" if num_hr_countries >= 3
            else "HIGH" if num_hr_countries >= 2
            else "MEDIUM"
        )

        return PredictionResult(
            attack_type="ACCOUNT_TAKEOVER",
            probability=round(probability, 3),
            confidence=round(confidence, 3),
            timeframe="1-6 hours",
            description=(
                f"Logins observed from {num_hr_countries} high-risk "
                f"countries ({', '.join(sorted(high_risk_countries))}). "
                f"{len(hr_logs)} log events originated from these regions, "
                f"representing {hr_ratio:.0%} of all traffic — strongly "
                f"indicative of account takeover or compromised credentials."
            ),
            affected_assets=affected_users,
            countermeasures=[
                "Force password reset for accounts with high-risk logins",
                "Enable geo-blocking for high-risk countries",
                "Enforce MFA for all user accounts",
                "Review VPN and proxy usage for anomalous sessions",
                "Cross-reference with known threat intel for source IPs",
            ],
            indicators=[
                f"High-risk countries: {', '.join(sorted(high_risk_countries))}",
                f"{len(hr_logs)} events from high-risk geolocations",
                f"{hr_ratio:.1%} of traffic from flagged regions",
            ],
            severity=severity,
        )

    # ── Heuristic 4: DDoS Build-up ───────────────────────────────────

    def _check_ddos_buildup(
        self, logs: list[LogEntry], stats: dict
    ) -> PredictionResult | None:
        epr = stats["events_per_hour"]
        total = stats["total_logs"]
        deny_count = stats["action_counts"].get("DENY", 0) + stats["action_counts"].get("DROP", 0)
        deny_ratio = deny_count / max(total, 1)
        unique_sources = len(stats["source_ips"])

        # Trigger: high event rate, many unique sources, or high deny ratio
        if epr < 20 and unique_sources < 30 and deny_ratio < 0.15:
            return None

        probability = _clamp(
            0.10
            + min(epr / 500, 0.35)
            + min(unique_sources / 200, 0.25)
            + deny_ratio * 0.3
        )
        confidence = _clamp(probability - 0.05)

        top_sources = [ip for ip, _ in stats["source_ips"].most_common(5)]
        top_targets = [ip for ip, _ in stats["dest_ips"].most_common(3)]

        severity = (
            "CRITICAL" if probability >= 0.7
            else "HIGH" if probability >= 0.45
            else "MEDIUM"
        )

        return PredictionResult(
            attack_type="DDOS_ATTACK",
            probability=round(probability, 3),
            confidence=round(confidence, 3),
            timeframe="1-6 hours",
            description=(
                f"Traffic volume trending at {epr:.1f} events/hour with "
                f"{unique_sources} unique sources and a {deny_ratio:.0%} "
                f"DENY/DROP ratio. Pattern is consistent with DDoS "
                f"build-up or volumetric flood preparation."
            ),
            affected_assets=top_targets,
            countermeasures=[
                "Activate DDoS mitigation / scrubbing service",
                "Rate-limit ingress traffic at edge routers",
                "Enable SYN cookies and connection-rate limiting",
                "Coordinate with upstream ISP for blackhole routing",
                "Scale backend infrastructure for surge capacity",
            ],
            indicators=[
                f"{epr:.1f} events per hour (elevated)",
                f"{unique_sources} unique source IPs",
                f"{deny_ratio:.0%} DENY/DROP action ratio",
                f"Top source IPs: {', '.join(top_sources[:3])}",
            ],
            severity=severity,
        )

    # ── Heuristic 5: Data Exfiltration ────────────────────────────────

    def _check_data_exfiltration(
        self, logs: list[LogEntry], stats: dict
    ) -> PredictionResult | None:
        data_events = stats["data_events"]
        off_hours = stats["off_hours_logs"]

        # Overlap: data events during off-hours
        off_hours_ips = {log.sourceIp for log in off_hours}
        data_ips = {log.sourceIp for log in data_events}
        overlap_ips = off_hours_ips & data_ips

        off_hour_data_count = sum(
            1 for log in data_events
            if _is_off_hours(_parse_dt(log.timestamp).hour)
        )

        data_count = len(data_events)
        off_count = len(off_hours)

        if data_count < 3 and off_hour_data_count < 2:
            return None

        probability = _clamp(
            0.15
            + min(data_count / 50, 0.25)
            + min(off_hour_data_count / 10, 0.30)
            + len(overlap_ips) * 0.05
        )
        confidence = _clamp(probability - 0.08)

        affected = list(overlap_ips | data_ips)[:5]

        severity = "HIGH" if off_hour_data_count >= 5 else "MEDIUM"

        return PredictionResult(
            attack_type="DATA_BREACH",
            probability=round(probability, 3),
            confidence=round(confidence, 3),
            timeframe="6-24 hours",
            description=(
                f"Detected {data_count} data access/transfer events, "
                f"{off_hour_data_count} occurring during off-hours "
                f"(before 07:00 or after 20:00). {len(overlap_ips)} IPs "
                f"performed data operations outside business hours — "
                f"pattern consistent with staged data exfiltration."
            ),
            affected_assets=affected,
            countermeasures=[
                "Enable DLP (Data Loss Prevention) alerts on all egress",
                "Block large file transfers outside business hours",
                "Review database audit logs for bulk SELECT/EXPORT queries",
                "Verify data access authorisation for flagged users",
                "Quarantine affected endpoints for forensic analysis",
            ],
            indicators=[
                f"{data_count} data access events detected",
                f"{off_hour_data_count} off-hours data operations",
                f"{len(overlap_ips)} IPs active both off-hours & data access",
            ],
            severity=severity,
        )

    # ── Heuristic 6: Insider Threat ───────────────────────────────────

    def _check_insider_threat(
        self, logs: list[LogEntry], stats: dict
    ) -> PredictionResult | None:
        priv_events = stats["priv_events"]
        off_hours = stats["off_hours_logs"]

        priv_users = {
            log.userId or log.userName or log.sourceIp for log in priv_events
        }
        off_hour_priv = [
            log for log in priv_events
            if _is_off_hours(_parse_dt(log.timestamp).hour)
        ]

        if not priv_events and len(stats["users_seen"]) < 5:
            return None

        # Unusual resource access: privileged user hitting many distinct targets
        priv_targets: Counter[str] = Counter()
        for log in priv_events:
            priv_targets[log.destinationIp] += 1

        diverse_access = len(priv_targets) >= 3

        probability = _clamp(
            0.10
            + min(len(priv_events) / 20, 0.25)
            + min(len(off_hour_priv) / 5, 0.20)
            + (0.15 if diverse_access else 0.0)
        )
        confidence = _clamp(probability - 0.05)

        if probability < 0.08:
            return None

        severity = "HIGH" if len(off_hour_priv) >= 3 else "MEDIUM"

        return PredictionResult(
            attack_type="INSIDER_THREAT",
            probability=round(probability, 3),
            confidence=round(confidence, 3),
            timeframe="24-72 hours",
            description=(
                f"Detected {len(priv_events)} privileged operations by "
                f"{len(priv_users)} users, with {len(off_hour_priv)} "
                f"occurring off-hours. Access to {len(priv_targets)} "
                f"distinct targets suggests potential insider abuse or "
                f"compromised privileged account."
            ),
            affected_assets=list(priv_users)[:5],
            countermeasures=[
                "Audit privileged account activity in last 72 hours",
                "Enforce just-in-time (JIT) privileged access",
                "Enable session recording for administrative sessions",
                "Review HR and access control changes for flagged users",
                "Implement behavioural analytics (UEBA) for privileged users",
            ],
            indicators=[
                f"{len(priv_events)} privileged operations detected",
                f"{len(off_hour_priv)} off-hours privileged accesses",
                f"{len(priv_targets)} distinct target systems accessed",
            ],
            severity=severity,
        )

    # ── Heuristic 7: Malware Propagation ──────────────────────────────

    def _check_malware_propagation(
        self, logs: list[LogEntry], stats: dict
    ) -> PredictionResult | None:
        malware = stats["malware_events"]
        if not malware:
            return None

        infected_hosts = {log.sourceIp for log in malware}
        targeted_hosts = {log.destinationIp for log in malware}

        probability = _clamp(0.45 + len(infected_hosts) * 0.08)
        confidence = _clamp(0.50 + len(infected_hosts) * 0.06)

        severity = (
            "CRITICAL" if len(infected_hosts) >= 3
            else "HIGH"
        )

        return PredictionResult(
            attack_type="MALWARE_LATERAL_MOVEMENT",
            probability=round(probability, 3),
            confidence=round(confidence, 3),
            timeframe="1-6 hours",
            description=(
                f"Malware detected on {len(infected_hosts)} host(s) "
                f"({', '.join(list(infected_hosts)[:3])}). Lateral "
                f"movement to {len(targeted_hosts)} additional systems "
                f"is probable given network adjacency and shared "
                f"credentials."
            ),
            affected_assets=list(infected_hosts | targeted_hosts)[:8],
            countermeasures=[
                "Isolate infected hosts from the network immediately",
                "Run full AV/EDR scans on adjacent network segments",
                "Reset credentials for accounts on infected hosts",
                "Block known C2 domains and IPs at the firewall",
                "Preserve forensic evidence before remediation",
            ],
            indicators=[
                f"{len(malware)} malware events detected",
                f"{len(infected_hosts)} infected source hosts",
                f"{len(targeted_hosts)} potential lateral-movement targets",
            ],
            severity=severity,
        )

    # ── Heuristic 8: Zero-Day Exploitation ────────────────────────────

    def _check_zero_day(
        self, logs: list[LogEntry], stats: dict
    ) -> PredictionResult | None:
        high_sev = stats["high_severity_logs"]
        total = stats["total_logs"]

        if not high_sev:
            return None

        high_ratio = len(high_sev) / max(total, 1)
        critical_count = stats["severity_counts"].get("CRITICAL", 0)
        block_count = (
            stats["action_counts"].get("BLOCK", 0)
            + stats["action_counts"].get("ALERT", 0)
        )

        # Look for unusual / unknown event types (not matching common patterns)
        common_events = {
            "CONNECTION", "DNS_QUERY", "HTTP_REQUEST", "LOGIN_SUCCESS",
            "LOGIN_FAILURE", "SESSION_START", "DATA_TRANSFER",
            "HEALTH_CHECK", "API_CALL", "ALLOW", "DENY",
        }
        unknown_events = [
            log for log in high_sev
            if (log.eventType or "").upper() not in common_events
        ]

        if len(unknown_events) < 2 and critical_count < 2:
            return None

        probability = _clamp(
            0.15
            + high_ratio * 0.3
            + min(len(unknown_events) / 10, 0.25)
            + min(critical_count / 5, 0.20)
        )
        confidence = _clamp(probability - 0.12)

        affected_ips = list(
            {log.destinationIp for log in high_sev}
        )[:5]

        severity = "CRITICAL" if critical_count >= 3 else "HIGH"

        return PredictionResult(
            attack_type="ZERO_DAY_EXPLOITATION",
            probability=round(probability, 3),
            confidence=round(confidence, 3),
            timeframe="6-24 hours",
            description=(
                f"Detected {len(high_sev)} high/critical severity events "
                f"with {len(unknown_events)} unrecognised event patterns. "
                f"{critical_count} CRITICAL-level alerts and {block_count} "
                f"BLOCK/ALERT actions suggest exploitation of an unknown "
                f"vulnerability not covered by existing signatures."
            ),
            affected_assets=affected_ips,
            countermeasures=[
                "Engage incident response team immediately",
                "Capture full packet traces on affected hosts",
                "Submit suspicious binaries / payloads to sandbox",
                "Deploy virtual patching via WAF/IPS rules",
                "Contact vendor for emergency security advisory",
            ],
            indicators=[
                f"{len(high_sev)} high/critical severity events",
                f"{len(unknown_events)} unknown / atypical event types",
                f"{critical_count} CRITICAL-level alerts",
                f"{block_count} BLOCK/ALERT actions triggered",
            ],
            severity=severity,
        )

    # ── Padding (ensure minimum 3 predictions) ────────────────────────

    def _pad_predictions(
        self,
        existing: list[PredictionResult],
        logs: list[LogEntry],
        stats: dict,
    ) -> list[PredictionResult]:
        """Ensure at least 3 predictions by adding low-probability
        baseline predictions for attack types not already present."""

        existing_types = {p.attack_type for p in existing}
        total = stats["total_logs"]
        deny_ratio = (
            (stats["action_counts"].get("DENY", 0)
             + stats["action_counts"].get("DROP", 0))
            / max(total, 1)
        )
        unique_sources = len(stats["source_ips"])
        high_sev_ratio = len(stats["high_severity_logs"]) / max(total, 1)

        padding_pool: list[PredictionResult] = []

        if "BRUTE_FORCE_ESCALATION" not in existing_types:
            failed_total = sum(stats["failed_logins_by_ip"].values())
            padding_pool.append(PredictionResult(
                attack_type="BRUTE_FORCE_ESCALATION",
                probability=round(_clamp(0.05 + failed_total * 0.01), 3),
                confidence=round(_clamp(0.08 + failed_total * 0.008), 3),
                timeframe="24-72 hours",
                description=(
                    f"Low-level credential probing detected — {failed_total} "
                    f"failed authentications across the window. Pattern does "
                    f"not yet indicate imminent escalation but warrants monitoring."
                ),
                affected_assets=list(stats["source_ips"].keys())[:3],
                countermeasures=[
                    "Monitor authentication logs for escalation",
                    "Review password policy enforcement",
                    "Enable account lockout thresholds",
                ],
                indicators=[
                    f"{failed_total} failed login events observed",
                    "No concentrated attack from single IP detected",
                ],
                severity="LOW",
            ))

        if "DDOS_ATTACK" not in existing_types:
            padding_pool.append(PredictionResult(
                attack_type="DDOS_ATTACK",
                probability=round(_clamp(0.05 + deny_ratio * 0.15), 3),
                confidence=round(_clamp(0.08 + deny_ratio * 0.10), 3),
                timeframe="24-72 hours",
                description=(
                    f"Baseline traffic analysis shows {stats['events_per_hour']:.1f} "
                    f"events/hour with {unique_sources} unique sources. No anomalous "
                    f"volumetric patterns detected, but continued monitoring advised."
                ),
                affected_assets=list(stats["dest_ips"].keys())[:3],
                countermeasures=[
                    "Ensure DDoS mitigation service is on standby",
                    "Verify edge firewall rate-limiting rules",
                    "Review CDN and load-balancer health",
                ],
                indicators=[
                    f"{stats['events_per_hour']:.1f} events/hour (baseline)",
                    f"{unique_sources} unique source IPs",
                    f"{deny_ratio:.1%} deny/drop ratio",
                ],
                severity="LOW",
            ))

        if "DATA_BREACH" not in existing_types:
            padding_pool.append(PredictionResult(
                attack_type="DATA_BREACH",
                probability=round(_clamp(0.04 + len(stats["data_events"]) * 0.01), 3),
                confidence=round(_clamp(0.06 + len(stats["data_events"]) * 0.008), 3),
                timeframe="24-72 hours",
                description=(
                    f"Detected {len(stats['data_events'])} data access events. "
                    f"No anomalous exfiltration pattern identified at this time, "
                    f"but data access volumes should be monitored."
                ),
                affected_assets=list(stats["dest_ips"].keys())[:3],
                countermeasures=[
                    "Review DLP policies and egress filtering",
                    "Audit database access logs for anomalies",
                    "Verify encryption of data at rest and in transit",
                ],
                indicators=[
                    f"{len(stats['data_events'])} data access events",
                    f"{len(stats['off_hours_logs'])} off-hours events",
                ],
                severity="LOW",
            ))

        if "ACCOUNT_TAKEOVER" not in existing_types:
            hr_count = len(stats["high_risk_country_logs"])
            padding_pool.append(PredictionResult(
                attack_type="ACCOUNT_TAKEOVER",
                probability=round(_clamp(0.03 + hr_count * 0.02), 3),
                confidence=round(_clamp(0.05 + hr_count * 0.015), 3),
                timeframe="24-72 hours",
                description=(
                    f"Geographic analysis shows traffic from "
                    f"{len(stats['countries_seen'])} countries, "
                    f"{hr_count} events from high-risk regions. "
                    f"No concentrated takeover pattern detected."
                ),
                affected_assets=list(stats["source_ips"].keys())[:3],
                countermeasures=[
                    "Review geo-access policies",
                    "Enforce MFA on all external-facing services",
                    "Monitor for impossible-travel detections",
                ],
                indicators=[
                    f"{len(stats['countries_seen'])} unique countries",
                    f"{hr_count} high-risk country events",
                ],
                severity="LOW",
            ))

        if "ZERO_DAY_EXPLOITATION" not in existing_types:
            padding_pool.append(PredictionResult(
                attack_type="ZERO_DAY_EXPLOITATION",
                probability=round(_clamp(0.03 + high_sev_ratio * 0.15), 3),
                confidence=round(_clamp(0.05 + high_sev_ratio * 0.10), 3),
                timeframe="24-72 hours",
                description=(
                    f"Baseline anomaly assessment shows "
                    f"{len(stats['high_severity_logs'])} high-severity events. "
                    f"No novel attack signatures detected, but unknown exploit "
                    f"risk remains non-zero."
                ),
                affected_assets=list(stats["dest_ips"].keys())[:3],
                countermeasures=[
                    "Keep all systems patched to latest versions",
                    "Monitor threat intel feeds for emerging CVEs",
                    "Ensure WAF and IPS signatures are up to date",
                ],
                indicators=[
                    f"{len(stats['high_severity_logs'])} high/critical events",
                    f"{high_sev_ratio:.1%} high-severity event ratio",
                ],
                severity="LOW",
            ))

        # Sort padding by probability descending, fill to minimum 3
        padding_pool.sort(key=lambda p: p.probability, reverse=True)
        result = list(existing)
        for pad in padding_pool:
            if len(result) >= 3:
                break
            if pad.attack_type not in existing_types:
                result.append(pad)
                existing_types.add(pad.attack_type)

        result.sort(key=lambda p: p.probability, reverse=True)
        return result
