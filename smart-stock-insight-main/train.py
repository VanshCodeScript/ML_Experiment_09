from __future__ import annotations

import logging
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from backend.config import (
    DATA_INTERVAL,
    DEFAULT_STOCKS,
    KMEANS_CLUSTERS,
    MODEL_DIR,
    RANDOM_STATE,
    TRAIN_PERIOD,
    setup_logging,
)
from backend.services.clustering_service import ClusteringService
from backend.services.data_loader import load_multi_stock_history
from backend.services.feature_engineering import FEATURE_COLUMNS, build_supervised_dataset
from backend.services.pca_service import PCAService
from backend.services.prediction_service import PredictionService

setup_logging()
logger = logging.getLogger("train")



def build_combined_dataset(symbols: list[str]) -> pd.DataFrame:
    stock_map = load_multi_stock_history(
        symbols=symbols,
        period=TRAIN_PERIOD,
        interval=DATA_INTERVAL,
        use_cache=True,
    )

    rows = []
    for symbol, frame in stock_map.items():
        stock_data = build_supervised_dataset(frame)
        stock_data["symbol"] = symbol
        rows.append(stock_data)

    if not rows:
        raise RuntimeError("No training rows were produced from stock data")

    combined = pd.concat(rows, axis=0, ignore_index=True)
    combined = combined.dropna().reset_index(drop=True)

    logger.info("Combined training dataset shape: %s", combined.shape)
    return combined



def main() -> None:
    logger.info("Training pipeline started")

    dataset = build_combined_dataset(DEFAULT_STOCKS)
    x = dataset[FEATURE_COLUMNS].values
    y = dataset["target_return"].values

    logger.info("Raw feature matrix shape: %s | target shape: %s", x.shape, y.shape)

    pca_service = PCAService()
    x_pca = pca_service.fit(x)

    logger.info(
        "PCA transformed shape: %s | retained variance: %.4f",
        x_pca.shape,
        float(np.sum(pca_service.pca.explained_variance_ratio_)),
    )

    clustering_service = ClusteringService(
        n_clusters=KMEANS_CLUSTERS,
        random_state=RANDOM_STATE,
    )
    labels = clustering_service.fit(x_pca)
    unique, counts = np.unique(labels, return_counts=True)
    logger.info("Cluster distribution: %s", dict(zip(unique.tolist(), counts.tolist())))

    x_train, x_test, y_train, y_test = train_test_split(
        x_pca,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        shuffle=True,
    )

    prediction_service = PredictionService(random_state=RANDOM_STATE)
    prediction_service.fit(x_train, y_train)

    preds = prediction_service.predict(x_test)
    mae = float(mean_absolute_error(y_test, preds))
    r2 = float(r2_score(y_test, preds))
    logger.info("Prediction metrics | MAE: %.6f | R2: %.6f", mae, r2)

    pca_service.save(
        scaler_path=str(MODEL_DIR / "scaler.pkl"),
        pca_path=str(MODEL_DIR / "pca.pkl"),
    )
    clustering_service.save(str(MODEL_DIR / "kmeans.pkl"))
    prediction_service.save(str(MODEL_DIR / "model.pkl"))

    metadata = {
        "feature_names": FEATURE_COLUMNS,
        "stocks": DEFAULT_STOCKS,
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "explained_variance_ratio": pca_service.pca.explained_variance_ratio_.tolist(),
        "rf_metrics": {"mae": mae, "r2": r2},
    }
    joblib.dump(metadata, MODEL_DIR / "metadata.pkl")

    logger.info("Training complete. Artifacts stored in %s", MODEL_DIR)


if __name__ == "__main__":
    main()
