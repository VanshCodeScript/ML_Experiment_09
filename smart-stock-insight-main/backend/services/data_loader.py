from __future__ import annotations

import logging
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Iterable

import pandas as pd
import yfinance as yf

from backend.config import CACHE_DIR

logger = logging.getLogger(__name__)


def _safe_name(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_.-]+", "_", value)


def _cache_path(symbol: str, period: str, interval: str) -> Path:
    filename = f"{_safe_name(symbol)}_{_safe_name(period)}_{_safe_name(interval)}.csv"
    return CACHE_DIR / filename


def _is_fresh(file_path: Path, max_age_hours: int) -> bool:
    if not file_path.exists():
        return False
    modified = datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc)
    return datetime.now(timezone.utc) - modified <= timedelta(hours=max_age_hours)


def fetch_stock_history(
    symbol: str,
    period: str,
    interval: str,
    use_cache: bool = True,
    max_age_hours: int = 12,
) -> pd.DataFrame:
    symbol = symbol.upper().strip()
    cache_file = _cache_path(symbol, period, interval)

    if use_cache and _is_fresh(cache_file, max_age_hours):
        cached = pd.read_csv(cache_file, index_col=0, parse_dates=True)
        if not cached.empty:
            logger.info("Using cached data for %s", symbol)
            return cached

    df = yf.download(
        tickers=symbol,
        period=period,
        interval=interval,
        auto_adjust=False,
        progress=False,
        threads=False,
    )

    if df.empty:
        raise ValueError(f"No data returned for symbol {symbol}")

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[0] for col in df.columns]

    required = ["Open", "High", "Low", "Close", "Volume"]
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns for {symbol}: {missing}")

    df = df[required].copy().sort_index()

    if use_cache:
        df.to_csv(cache_file)

    return df


def fetch_stock_data(symbol: str) -> pd.DataFrame:
    """Fetch 2 years of daily OHLCV data for real-time analyze endpoint usage."""
    clean_symbol = symbol.upper().strip()
    try:
        print(f"Fetching: {clean_symbol}")
        logger.info("Fetching: %s", clean_symbol)

        df = yf.download(
            clean_symbol,
            period="2y",
            interval="1d",
            progress=False,
            auto_adjust=False,
            threads=False,
        )

        if df is None or df.empty:
            raise ValueError(f"No data found for {clean_symbol}")

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0] for col in df.columns]

        required = ["Open", "High", "Low", "Close", "Volume"]
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns for {clean_symbol}: {missing}")

        # Return a clean dataframe with index materialized for easier API serialization/debugging.
        clean = df[required].copy().sort_index().reset_index()

        print(f"Rows fetched: {len(clean)}")
        logger.info("Rows fetched: %s", len(clean))
        return clean

    except Exception as exc:
        raise Exception(f"Error fetching data for {clean_symbol}: {str(exc)}") from exc


def load_multi_stock_history(
    symbols: Iterable[str],
    period: str,
    interval: str,
    use_cache: bool = True,
) -> Dict[str, pd.DataFrame]:
    result: Dict[str, pd.DataFrame] = {}
    for symbol in symbols:
        try:
            result[symbol] = fetch_stock_history(
                symbol=symbol,
                period=period,
                interval=interval,
                use_cache=use_cache,
            )
        except Exception as exc:
            logger.warning("Skipping %s due to data loading error: %s", symbol, exc)
    if not result:
        raise RuntimeError("No stock data could be loaded.")
    return result


def load_stock_csv(content: bytes) -> pd.DataFrame:
    df = pd.read_csv(pd.io.common.BytesIO(content))
    lower_map = {c.lower(): c for c in df.columns}
    required = ["open", "high", "low", "close", "volume"]
    missing = [c for c in required if c not in lower_map]
    if missing:
        raise ValueError(f"CSV missing required columns: {missing}")

    canonical = {
        "Open": df[lower_map["open"]],
        "High": df[lower_map["high"]],
        "Low": df[lower_map["low"]],
        "Close": df[lower_map["close"]],
        "Volume": df[lower_map["volume"]],
    }
    clean = pd.DataFrame(canonical)

    if "date" in lower_map:
        clean.index = pd.to_datetime(df[lower_map["date"]])
    elif "datetime" in lower_map:
        clean.index = pd.to_datetime(df[lower_map["datetime"]])

    return clean.sort_index()
