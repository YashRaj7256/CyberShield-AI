"""
Application configuration using environment variables with sensible defaults.

All settings can be overridden via environment variables or a .env file.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env file if present (no error if missing)
load_dotenv()


class Settings:
    """Centralised application settings resolved from environment variables."""

    def __init__(self) -> None:
        # ── Paths ──────────────────────────────────────────────────────
        self.BASE_DIR: Path = Path(__file__).resolve().parent.parent
        self.MODEL_DIR: Path = Path(
            os.getenv("MODEL_DIR", str(self.BASE_DIR / "models"))
        )
        self.DATA_DIR: Path = Path(
            os.getenv("DATA_DIR", str(self.BASE_DIR / "data"))
        )

        # ── Model hyper-parameters ─────────────────────────────────────
        self.CONTAMINATION: float = float(
            os.getenv("CONTAMINATION", "0.05")
        )
        self.N_ESTIMATORS: int = int(os.getenv("N_ESTIMATORS", "200"))
        self.RANDOM_STATE: int = int(os.getenv("RANDOM_STATE", "42"))
        self.SVM_NU: float = float(os.getenv("SVM_NU", "0.05"))
        self.SVM_KERNEL: str = os.getenv("SVM_KERNEL", "rbf")
        self.SVM_GAMMA: str = os.getenv("SVM_GAMMA", "scale")

        # ── Threat scoring ─────────────────────────────────────────────
        self.THREAT_THRESHOLD: int = int(
            os.getenv("THREAT_THRESHOLD", "60")
        )

        # ── Risk intelligence ──────────────────────────────────────────
        _high_risk_raw = os.getenv("HIGH_RISK_COUNTRIES", "RU,CN,KP,IR,NG")
        self.HIGH_RISK_COUNTRIES: list[str] = [
            c.strip().upper() for c in _high_risk_raw.split(",") if c.strip()
        ]

        # ── Synthetic data ─────────────────────────────────────────────
        self.SYNTHETIC_SAMPLE_COUNT: int = int(
            os.getenv("SYNTHETIC_SAMPLE_COUNT", "2000")
        )

        # ── Feature names (constant) ──────────────────────────────────
        self.FEATURE_NAMES: list[str] = [
            "hour",
            "is_login_failure",
            "protocol_risk",
            "source_weight",
            "country_risk",
            "severity_level",
            "port_risk",
            "action_type",
        ]

    # Convenience -------------------------------------------------------
    def ensure_dirs(self) -> None:
        """Create MODEL_DIR and DATA_DIR if they don't already exist."""
        self.MODEL_DIR.mkdir(parents=True, exist_ok=True)
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)


# Module-level singleton so the rest of the app can do:
#   from app.config import settings
settings = Settings()
