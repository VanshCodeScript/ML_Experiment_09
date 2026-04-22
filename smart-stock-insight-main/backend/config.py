from __future__ import annotations

import logging
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
CACHE_DIR = BASE_DIR / "cache"

DEFAULT_STOCKS = ["AAPL", "MSFT", "GOOG", "TSLA", "AMZN"]
TRAIN_PERIOD = "10y"
INFERENCE_PERIOD = "1y"
DATA_INTERVAL = "1d"
KMEANS_CLUSTERS = 4
RANDOM_STATE = 42

for directory in (MODEL_DIR, CACHE_DIR):
    directory.mkdir(parents=True, exist_ok=True)


def setup_logging() -> None:
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
