#!/usr/bin/env python3
"""
Windows Security Telemetry Collector for CyberShield AI
======================================================

Collects genuine security events from the local Windows system,
normalizes them to the platform's SecurityLog schema, and forwards
them to the NestJS ingestion API (/api/logs/bulk).

Supported Modes:
  python collector.py --once       # Collect once and exit
  python collector.py --watch      # Continuous polling mode
  python collector.py --dry-run    # Inspect normalized logs locally without sending

Features:
  - Direct Windows Event Log queries (wevtutil / PowerShell)
  - Security events (4624, 4625, 4634, 4648, 4672, 4688, 4720, 4726, 4740)
  - Microsoft Defender & System security events
  - Watermark-based duplicate prevention (.collector_state.json)
  - Automatic JWT authentication against NestJS backend
  - Zero external pip dependencies (standard library only)
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Local imports
from config import CollectorConfig
from normalizer import normalize_event
from win_events import RawWinEvent, WindowsEventReader, is_elevated

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("windows_collector")


class BackendApiClient:
    """Handles authentication and log ingestion requests to the NestJS API."""

    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip("/")
        self.username = username
        self.password = password
        self.access_token: Optional[str] = None
        self.token_expiry: float = 0

    def authenticate(self) -> bool:
        """Authenticate with the backend and store the JWT access token."""
        login_url = f"{self.base_url}/api/auth/login"
        payload = json.dumps({"email": self.username, "password": self.password}).encode("utf-8")
        req = urllib.request.Request(
            login_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                # NestJS returns { success: true, data: { accessToken: "..." } }
                res_data = data.get("data") or data
                self.access_token = res_data.get("accessToken")
                # Tokens usually expire in 15m; renew after 12m
                self.token_expiry = time.time() + 720
                logger.info("Successfully authenticated with backend as '%s'", self.username)
                return True
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            logger.error("Authentication failed (HTTP %d): %s", e.code, err_body)
            return False
        except Exception as ex:
            logger.error("Error connecting to backend at %s: %s", self.base_url, ex)
            return False

    def ingest_logs_bulk(self, logs: List[Dict[str, Any]]) -> int:
        """Post a batch of normalized security logs to /api/logs/bulk."""
        if not logs:
            return 0

        # Ensure active token
        if not self.access_token or time.time() >= self.token_expiry:
            if not self.authenticate():
                logger.error("Cannot ingest logs: Authentication failed.")
                return 0

        ingest_url = f"{self.base_url}/api/logs/bulk"
        payload = json.dumps({"logs": logs}).encode("utf-8")
        req = urllib.request.Request(
            ingest_url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.access_token}",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                res_data = data.get("data") or data
                inserted = res_data.get("inserted", len(logs))
                return inserted
        except urllib.error.HTTPError as e:
            if e.code == 401:
                # Token may have expired; try re-authenticating once
                logger.warning("Token expired (401). Re-authenticating...")
                if self.authenticate():
                    return self.ingest_logs_bulk(logs)
            err_body = e.read().decode("utf-8", errors="replace")
            logger.error("Log ingestion failed (HTTP %d): %s", e.code, err_body)
            return 0
        except Exception as ex:
            logger.error("Error sending logs to backend: %s", ex)
            return 0


class StateManager:
    """Tracks processed record IDs to prevent duplicate log submissions."""

    def __init__(self, state_file: Path):
        self.state_file = state_file
        self.channel_watermarks: Dict[str, int] = {}
        self.seen_signatures: Set[str] = set()
        self.load()

    def load(self) -> None:
        if self.state_file.is_file():
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.channel_watermarks = data.get("watermarks", {})
                    self.seen_signatures = set(data.get("seen_signatures", []))
                    logger.debug("Loaded state: %d channel watermarks", len(self.channel_watermarks))
            except Exception as e:
                logger.warning("Could not read state file: %s", e)

    def save(self) -> None:
        try:
            self.state_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.state_file, "w", encoding="utf-8") as f:
                # Keep up to 5000 recent signatures to cap file size
                sigs = list(self.seen_signatures)[-5000:]
                json.dump(
                    {
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                        "watermarks": self.channel_watermarks,
                        "seen_signatures": sigs,
                    },
                    f,
                    indent=2,
                )
        except Exception as e:
            logger.warning("Could not save state file: %s", e)

    def is_duplicate(self, event: RawWinEvent) -> bool:
        """Check if an event was already processed."""
        # Check channel high watermark
        high = self.channel_watermarks.get(event.channel, 0)
        if event.record_id > 0 and event.record_id <= high:
            return True

        sig = f"{event.channel}:{event.event_id}:{event.record_id}:{event.timestamp}"
        if sig in self.seen_signatures:
            return True

        return False

    def mark_processed(self, event: RawWinEvent) -> None:
        """Record an event as processed."""
        if event.record_id > self.channel_watermarks.get(event.channel, 0):
            self.channel_watermarks[event.channel] = event.record_id

        sig = f"{event.channel}:{event.event_id}:{event.record_id}:{event.timestamp}"
        self.seen_signatures.add(sig)


class WindowsLogCollector:
    """Coordinates Windows Event Log reading, deduplication, and backend ingestion."""

    def __init__(
        self,
        backend_url: str = CollectorConfig.BACKEND_URL,
        username: str = CollectorConfig.COLLECTOR_USERNAME,
        password: str = CollectorConfig.COLLECTOR_PASSWORD,
        interval: int = CollectorConfig.COLLECTOR_INTERVAL,
        state_file: Path = CollectorConfig.STATE_FILE,
        dry_run: bool = False,
        limit: int = CollectorConfig.BATCH_SIZE,
    ):
        self.backend_url = backend_url
        self.interval = interval
        self.dry_run = dry_run
        self.limit = limit
        self.client = BackendApiClient(backend_url, username, password)
        self.state = StateManager(state_file)
        self.is_admin = is_elevated()

    def run_cycle(self) -> int:
        """Run one collection and ingestion cycle. Returns number of ingested events."""
        logger.info("Scanning Windows Event Logs (Elevated Admin: %s)...", self.is_admin)

        raw_events = WindowsEventReader.collect_available_events(
            max_events_per_channel=self.limit,
            last_seen_records=self.state.channel_watermarks,
        )

        # Filter duplicates
        new_events: List[RawWinEvent] = []
        for ev in raw_events:
            if not self.state.is_duplicate(ev):
                new_events.append(ev)

        if not new_events:
            logger.info("No new Windows events detected since last cycle.")
            return 0

        logger.info("Found %d new event(s) to process.", len(new_events))

        # Normalize events to SecurityLog schema
        normalized_logs: List[Dict[str, Any]] = []
        for ev in new_events:
            norm = normalize_event(ev, device_type=CollectorConfig.DEVICE_TYPE)
            normalized_logs.append(norm)

        # Dry-run mode: print sample and exit
        if self.dry_run:
            logger.info("[DRY RUN] Ingestion skipped. Sample normalized event:")
            sample = normalized_logs[0] if normalized_logs else {}
            print(json.dumps(sample, indent=2))
            return len(normalized_logs)

        # Ingest to backend
        inserted_count = self.client.ingest_logs_bulk(normalized_logs)
        logger.info("Successfully ingested %d / %d real event(s) into backend.", inserted_count, len(normalized_logs))

        # Update and save watermarks
        for ev in new_events:
            self.state.mark_processed(ev)
        self.state.save()

        return inserted_count

    def run_once(self) -> None:
        """One-time collection pass."""
        logger.info("=== Windows Security Collector: Single Run ===")
        count = self.run_cycle()
        logger.info("Finished. Total logs ingested: %d", count)

    def run_watch(self) -> None:
        """Continuous polling mode."""
        logger.info("=== Windows Security Collector: Watch Mode (Interval: %ds) ===", self.interval)
        logger.info("Press Ctrl+C to stop.")
        try:
            while True:
                self.run_cycle()
                time.sleep(self.interval)
        except KeyboardInterrupt:
            logger.info("Stopping Windows Security Collector...")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Windows Security Telemetry Collector for CyberShield AI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python collector.py --once\n"
            "  python collector.py --watch --interval 10\n"
            "  python collector.py --dry-run\n"
        ),
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--once",
        action="store_true",
        default=False,
        help="Run a single collection cycle and exit",
    )
    group.add_argument(
        "--watch",
        action="store_true",
        default=False,
        help="Run continuously in polling mode",
    )

    parser.add_argument(
        "--interval",
        type=int,
        default=CollectorConfig.COLLECTOR_INTERVAL,
        help=f"Polling interval in seconds (default: {CollectorConfig.COLLECTOR_INTERVAL})",
    )
    parser.add_argument(
        "--backend-url",
        type=str,
        default=CollectorConfig.BACKEND_URL,
        help=f"NestJS backend API base URL (default: {CollectorConfig.BACKEND_URL})",
    )
    parser.add_argument(
        "--username",
        type=str,
        default=CollectorConfig.COLLECTOR_USERNAME,
        help="API username (email)",
    )
    parser.add_argument(
        "--password",
        type=str,
        default=CollectorConfig.COLLECTOR_PASSWORD,
        help="API password",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=CollectorConfig.BATCH_SIZE,
        help=f"Max events to collect per channel per cycle (default: {CollectorConfig.BATCH_SIZE})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Parse and display normalized logs without sending to backend",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        default=False,
        help="Enable verbose debug logging",
    )

    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.verbose:
        logger.setLevel(logging.DEBUG)

    # Default to --once if neither --once nor --watch is specified
    is_watch = args.watch
    collector = WindowsLogCollector(
        backend_url=args.backend_url,
        username=args.username,
        password=args.password,
        interval=args.interval,
        dry_run=args.dry_run,
        limit=args.limit,
    )

    if is_watch:
        collector.run_watch()
    else:
        collector.run_once()


if __name__ == "__main__":
    main()
