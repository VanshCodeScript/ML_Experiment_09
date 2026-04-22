from __future__ import annotations

import logging
from typing import List

import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator, MACD, SMAIndicator
from ta.volatility import BollingerBands

logger = logging.getLogger(__name__)

FEATURE_COLUMNS: List[str] = [
    "Open",
    "High",
    "Low",
    "Close",
    "Volume",
    "RSI",
    "MACD",
    "EMA_20",
    "SMA_20",
    "BB_upper",
    "BB_lower",
    "Volatility_20",
    "Returns",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    frame = df.copy()
    frame = frame[["Open", "High", "Low", "Close", "Volume"]].astype(float)

    frame["RSI"] = RSIIndicator(close=frame["Close"], window=14).rsi()

    macd = MACD(close=frame["Close"], window_fast=12, window_slow=26, window_sign=9)
    frame["MACD"] = macd.macd()

    frame["EMA_20"] = EMAIndicator(close=frame["Close"], window=20).ema_indicator()
    frame["SMA_20"] = SMAIndicator(close=frame["Close"], window=20).sma_indicator()

    bbands = BollingerBands(close=frame["Close"], window=20, window_dev=2)
    frame["BB_upper"] = bbands.bollinger_hband()
    frame["BB_lower"] = bbands.bollinger_lband()

    frame["Returns"] = frame["Close"].pct_change()
    frame["Volatility_20"] = frame["Returns"].rolling(window=20).std()

    frame = frame.dropna()
    return frame[FEATURE_COLUMNS]


def build_supervised_dataset(df: pd.DataFrame) -> pd.DataFrame:
    features = engineer_features(df)
    aligned_close = df["Close"].reindex(features.index).astype(float)

    data = features.copy()
    data["target_return"] = aligned_close.shift(-1) / aligned_close - 1.0
    data["target_close"] = aligned_close.shift(-1)

    data = data.dropna()
    logger.info("Supervised dataset created with shape %s", data.shape)
    return data


def align_features(features: pd.DataFrame, feature_names: List[str]) -> pd.DataFrame:
    missing = [f for f in feature_names if f not in features.columns]
    if missing:
        raise ValueError(f"Feature mismatch. Missing columns: {missing}")
    return features[feature_names].copy()
