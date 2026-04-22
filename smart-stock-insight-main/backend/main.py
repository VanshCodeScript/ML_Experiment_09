from __future__ import annotations

import logging
from pathlib import Path

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import MODEL_DIR, setup_logging
from backend.routes.analyze import router as analyze_router
from backend.routes.components import router as components_router
from backend.routes.predict import router as predict_router

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Stock Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(predict_router)
app.include_router(components_router)


@app.get("/")
def root() -> dict:
    return {"status": "ok", "service": "smart-stock-analyzer"}


@app.on_event("startup")
def load_models() -> None:
    required_files = {
        "scaler": MODEL_DIR / "scaler.pkl",
        "pca": MODEL_DIR / "pca.pkl",
        "kmeans": MODEL_DIR / "kmeans.pkl",
        "predictor": MODEL_DIR / "model.pkl",
        "metadata": MODEL_DIR / "metadata.pkl",
    }

    missing = [name for name, path in required_files.items() if not Path(path).exists()]
    if missing:
        missing_text = ", ".join(missing)
        raise RuntimeError(
            f"Missing trained artifacts: {missing_text}. Run train.py before starting API."
        )

    app.state.scaler = joblib.load(required_files["scaler"])
    app.state.pca = joblib.load(required_files["pca"])
    app.state.kmeans = joblib.load(required_files["kmeans"])
    app.state.predictor = joblib.load(required_files["predictor"])
    app.state.metadata = joblib.load(required_files["metadata"])

    logger.info("All trained models loaded successfully")
