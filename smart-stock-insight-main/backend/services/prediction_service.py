from __future__ import annotations

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor


class PredictionService:
    def __init__(self, random_state: int = 42) -> None:
        self.model = RandomForestRegressor(
            n_estimators=500,
            random_state=random_state,
            n_jobs=-1,
            max_depth=12,
            min_samples_leaf=2,
        )

    def fit(self, x_pca: np.ndarray, y: np.ndarray) -> None:
        self.model.fit(x_pca, y)

    def predict(self, x_pca: np.ndarray) -> np.ndarray:
        return self.model.predict(x_pca)

    def save(self, model_path: str) -> None:
        joblib.dump(self.model, model_path)

    @staticmethod
    def load(model_path: str) -> RandomForestRegressor:
        return joblib.load(model_path)
