from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from backend.config import DATA_INTERVAL, INFERENCE_PERIOD
from backend.services.data_loader import fetch_stock_history
from backend.services.feature_engineering import align_features, engineer_features

router = APIRouter(tags=["predict"])


class SymbolRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)


class PredictResponse(BaseModel):
    predicted_price: float
    trend: str
    confidence: float
    horizon: str
    latest_close: float
    expected_change_pct: float
    reasons: list[str]


@router.post("/predict", response_model=PredictResponse)
def predict_stock(payload: SymbolRequest, request: Request) -> PredictResponse:
    try:
        frame = fetch_stock_history(
            symbol=payload.symbol,
            period=INFERENCE_PERIOD,
            interval=DATA_INTERVAL,
            use_cache=True,
        )

        metadata = request.app.state.metadata
        features = engineer_features(frame)
        aligned = align_features(features, metadata["feature_names"])

        scaler = request.app.state.scaler
        pca = request.app.state.pca
        predictor = request.app.state.predictor

        x_scaled = scaler.transform(aligned.values)
        x_pca = pca.transform(x_scaled)

        predicted_returns = predictor.predict(x_pca)
        predicted_return = float(predicted_returns[-1])

        latest_close = float(frame["Close"].iloc[-1])
        predicted_price = latest_close * (1.0 + predicted_return)

        trend = "UP" if predicted_return >= 0 else "DOWN"
        expected_change_pct = float(predicted_return * 100.0)

        # Confidence normalized to [0, 1] from expected move magnitude.
        confidence = min(1.0, max(0.15, abs(predicted_return) * 18.0))

        latest_pc = x_pca[-1]
        pc1 = float(latest_pc[0]) if len(latest_pc) > 0 else 0.0
        pc2 = float(latest_pc[1]) if len(latest_pc) > 1 else 0.0

        reasons: list[str] = []
        if pc1 > 0:
            reasons.append("Strong positive trend signal from PC1")
        else:
            reasons.append("Weak/negative trend signal from PC1")

        if pc2 < 0:
            reasons.append("Lower volatility regime from PC2")
        else:
            reasons.append("Elevated volatility pressure from PC2")

        if predicted_return >= 0:
            reasons.append("Model expects upside move in next session")
        else:
            reasons.append("Model expects downside move in next session")

        return PredictResponse(
            predicted_price=predicted_price,
            trend=trend,
            confidence=confidence,
            horizon="1d",
            latest_close=latest_close,
            expected_change_pct=expected_change_pct,
            reasons=reasons,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
