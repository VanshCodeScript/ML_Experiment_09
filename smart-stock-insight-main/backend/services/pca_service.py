from __future__ import annotations

from typing import Dict, List

import joblib
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


class PCAService:
    def __init__(self) -> None:
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=0.95, random_state=42)

    def fit(self, x: np.ndarray) -> np.ndarray:
        x_scaled = self.scaler.fit_transform(x)
        return self.pca.fit_transform(x_scaled)

    def transform(self, x: np.ndarray) -> np.ndarray:
        x_scaled = self.scaler.transform(x)
        return self.pca.transform(x_scaled)

    def save(self, scaler_path: str, pca_path: str) -> None:
        joblib.dump(self.scaler, scaler_path)
        joblib.dump(self.pca, pca_path)

    @staticmethod
    def load(scaler_path: str, pca_path: str) -> tuple[StandardScaler, PCA]:
        scaler = joblib.load(scaler_path)
        pca = joblib.load(pca_path)
        return scaler, pca



def get_component_interpretation(
    pca: PCA,
    feature_names: List[str],
    top_n: int = 5,
) -> List[Dict[str, object]]:
    output: List[Dict[str, object]] = []

    for i, weights in enumerate(pca.components_):
        pairs = list(zip(feature_names, weights))
        ranked = sorted(pairs, key=lambda pair: abs(pair[1]), reverse=True)[:top_n]

        output.append(
            {
                "component": f"PC{i + 1}",
                "top_features": [
                    {"feature": name, "weight": float(weight)} for name, weight in ranked
                ],
            }
        )

    return output
