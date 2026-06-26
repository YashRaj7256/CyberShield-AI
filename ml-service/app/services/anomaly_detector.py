"""
Anomaly detection service using an ensemble of Isolation Forest and One-Class SVM.

Models are trained on *normal* network traffic; at inference time the ensemble
returns a score in [0, 1] where **0 = normal** and **1 = highly anomalous**.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM

from app.config import settings

logger = logging.getLogger(__name__)

# File names for persisted artefacts
_IF_FILE = "isolation_forest.joblib"
_SVM_FILE = "ocsvm.joblib"
_SCALER_FILE = "scaler.joblib"
_META_FILE = "model_meta.joblib"


class AnomalyDetector:
    """Ensemble anomaly detector (Isolation Forest + One-Class SVM).

    Parameters
    ----------
    model_dir : str | Path | None
        Directory where trained model artefacts are stored.  Falls back to
        ``settings.MODEL_DIR`` when *None*.
    """

    def __init__(self, model_dir: str | Path | None = None) -> None:
        self.model_dir = Path(model_dir or settings.MODEL_DIR)
        self.model_dir.mkdir(parents=True, exist_ok=True)

        self.isolation_forest: Optional[IsolationForest] = None
        self.ocsvm: Optional[OneClassSVM] = None
        self.scaler: Optional[StandardScaler] = None
        self.meta: dict = {}

        self._loaded = False
        self._try_load()

    # ── Properties ────────────────────────────────────────────────────

    @property
    def is_loaded(self) -> bool:
        """``True`` when all three artefacts (IF, SVM, scaler) are in memory."""
        return self._loaded

    # ── Training ──────────────────────────────────────────────────────

    def train(self, features: np.ndarray) -> dict:
        """Fit the ensemble on *features* (assumed to be mostly normal traffic).

        Returns a dict with basic training metrics.
        """
        logger.info("Training anomaly detector on %d samples …", len(features))

        # 1. Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(features)

        # 2. Isolation Forest
        self.isolation_forest = IsolationForest(
            contamination=settings.CONTAMINATION,
            n_estimators=settings.N_ESTIMATORS,
            random_state=settings.RANDOM_STATE,
        )
        self.isolation_forest.fit(X_scaled)

        # 3. One-Class SVM
        self.ocsvm = OneClassSVM(
            kernel=settings.SVM_KERNEL,
            nu=settings.SVM_NU,
            gamma=settings.SVM_GAMMA,
        )
        self.ocsvm.fit(X_scaled)

        # 4. Gather training-set statistics for normalisation at inference
        if_scores = self.isolation_forest.decision_function(X_scaled)
        svm_scores = self.ocsvm.decision_function(X_scaled)

        self.meta = {
            "n_samples": int(len(features)),
            "n_features": int(features.shape[1]),
            "if_score_min": float(np.min(if_scores)),
            "if_score_max": float(np.max(if_scores)),
            "svm_score_min": float(np.min(svm_scores)),
            "svm_score_max": float(np.max(svm_scores)),
            "contamination": settings.CONTAMINATION,
            "n_estimators": settings.N_ESTIMATORS,
        }

        # 5. Persist artefacts
        self._save()
        self._loaded = True

        logger.info("Training complete.  Meta: %s", self.meta)
        return self.meta

    # ── Inference ─────────────────────────────────────────────────────

    def predict(self, features: np.ndarray) -> np.ndarray:
        """Return anomaly scores in [0, 1] for each row of *features*.

        The score is the mean of the normalised Isolation Forest and
        One-Class SVM decision-function values.  A higher value indicates
        a more anomalous observation.
        """
        if not self._loaded:
            raise RuntimeError(
                "Anomaly detector has not been trained or loaded. "
                "Call /api/v1/train first."
            )

        assert self.scaler is not None
        assert self.isolation_forest is not None
        assert self.ocsvm is not None

        X_scaled = self.scaler.transform(features)

        # Raw decision-function values (higher → *more normal* for sklearn)
        if_raw = self.isolation_forest.decision_function(X_scaled)
        svm_raw = self.ocsvm.decision_function(X_scaled)

        # Normalise to [0, 1] and *invert* so that 1 = anomalous
        if_norm = self._normalise_inverted(
            if_raw,
            self.meta.get("if_score_min", float(np.min(if_raw))),
            self.meta.get("if_score_max", float(np.max(if_raw))),
        )
        svm_norm = self._normalise_inverted(
            svm_raw,
            self.meta.get("svm_score_min", float(np.min(svm_raw))),
            self.meta.get("svm_score_max", float(np.max(svm_raw))),
        )

        # Ensemble average
        return (if_norm + svm_norm) / 2.0

    # ── Private helpers ───────────────────────────────────────────────

    @staticmethod
    def _normalise_inverted(
        raw: np.ndarray, vmin: float, vmax: float
    ) -> np.ndarray:
        """Min-max normalise, then invert so 0 = normal, 1 = anomalous.

        In sklearn, decision_function values are *higher* for normal points
        and *lower* (more negative) for anomalies.  We flip that convention.
        """
        denom = vmax - vmin
        if abs(denom) < 1e-12:
            # All scores are identical — return 0 (all normal)
            return np.zeros_like(raw)
        normalised = (raw - vmin) / denom
        normalised = np.clip(normalised, 0.0, 1.0)
        return 1.0 - normalised  # invert: low raw → high anomaly

    def _save(self) -> None:
        """Persist all artefacts to *self.model_dir*."""
        self.model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.isolation_forest, self.model_dir / _IF_FILE)
        joblib.dump(self.ocsvm, self.model_dir / _SVM_FILE)
        joblib.dump(self.scaler, self.model_dir / _SCALER_FILE)
        joblib.dump(self.meta, self.model_dir / _META_FILE)
        logger.info("Models saved to %s", self.model_dir)

    def _try_load(self) -> None:
        """Attempt to load previously saved artefacts."""
        paths = {
            "if": self.model_dir / _IF_FILE,
            "svm": self.model_dir / _SVM_FILE,
            "scaler": self.model_dir / _SCALER_FILE,
            "meta": self.model_dir / _META_FILE,
        }

        if not all(p.exists() for p in paths.values()):
            logger.info("No saved models found in %s", self.model_dir)
            return

        try:
            self.isolation_forest = joblib.load(paths["if"])
            self.ocsvm = joblib.load(paths["svm"])
            self.scaler = joblib.load(paths["scaler"])
            self.meta = joblib.load(paths["meta"])
            self._loaded = True
            logger.info("Models loaded from %s", self.model_dir)
        except Exception:
            logger.exception("Failed to load models from %s", self.model_dir)
            self._loaded = False
