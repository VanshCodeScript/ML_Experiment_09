from __future__ import annotations

import joblib
import numpy as np
from sklearn.cluster import KMeans


class ClusteringService:
    def __init__(self, n_clusters: int = 4, random_state: int = 42) -> None:
        self.model = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=20)

    def fit(self, x_pca: np.ndarray) -> np.ndarray:
        return self.model.fit_predict(x_pca)

    def predict(self, x_pca: np.ndarray) -> np.ndarray:
        return self.model.predict(x_pca)

    def save(self, model_path: str) -> None:
        joblib.dump(self.model, model_path)

    @staticmethod
    def load(model_path: str) -> KMeans:
        return joblib.load(model_path)
