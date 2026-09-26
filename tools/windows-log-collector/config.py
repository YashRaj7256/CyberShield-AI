"""
Configuration settings for the Windows Log Collector.
Loads settings from environment variables or falls back to secure defaults.
"""

from __future__ import annotations

import os
import socket
from pathlib import Path
from typing import Optional


def load_env_file(env_path: Optional[Path] = None) -> None:
    """Simple parser for .env files without requiring python-dotenv."""
    if env_path is None:
        # Check current directory, collector directory, and project root
        candidates = [
            Path(".env"),
            Path(__file__).parent / ".env",
            Path(__file__).parent.parent.parent / ".env",
        ]
        for candidate in candidates:
            if candidate.is_file():
                env_path = candidate
                break

    if env_path and env_path.is_file():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                key = key.strip()
                val = val.strip().strip("'\"")
                if key and key not in os.environ:
                    os.environ[key] = val


# Load any .env files
load_env_file()


class CollectorConfig:
    """Collector configuration holder."""

    # Backend API configuration
    BACKEND_URL: str = os.environ.get("BACKEND_URL", "http://localhost:3001").rstrip("/")
    COLLECTOR_INTERVAL: int = int(os.environ.get("COLLECTOR_INTERVAL", "10"))
    COLLECTOR_HOSTNAME: str = os.environ.get("COLLECTOR_HOSTNAME", socket.gethostname())

    # Authentication credentials for NestJS API
    COLLECTOR_USERNAME: str = os.environ.get("COLLECTOR_USERNAME", "admin@cti.com")
    COLLECTOR_PASSWORD: str = os.environ.get("COLLECTOR_PASSWORD", "Admin@123")

    # Ingestion batching & lookback
    BATCH_SIZE: int = int(os.environ.get("BATCH_SIZE", "50"))
    LOOKBACK_HOURS: int = int(os.environ.get("LOOKBACK_HOURS", "24"))

    # State file for duplicate prevention
    STATE_FILE: Path = Path(os.environ.get("STATE_FILE", Path(__file__).parent / ".collector_state.json"))

    # Device metadata
    DEVICE_TYPE: str = os.environ.get("DEVICE_TYPE", "Windows Laptop")
    OS_NAME: str = "Windows"
