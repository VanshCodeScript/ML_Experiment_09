from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import pandas as pd
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from backend.services.data_loader import fetch_stock_data, load_stock_csv
from backend.services.feature_engineering import align_features, engineer_features
from backend.services.pca_service import get_component_interpretation

router = APIRouter(tags=["analyze"])


class SymbolRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)


class AnalyzeResponse(BaseModel):
    pca_points: List[List[float]]
    clusters: List[int]
    explained_variance: List[float]
    latest_cluster: int
    rows: int
    columns: List[str]
    sample: Dict[str, Dict[str, Any]]
    pca_insights: List[Dict[str, Any]]
    trajectory: List[Dict[str, Any]]
    price_history: List[Dict[str, Any]]
    cluster_comparison: List[Dict[str, Any]]
    market_state: str
    variance_story: str
    # New PCA-deep fields
    component_weights: List[Dict[str, Any]]
    cumulative_variance: List[float]
    dimension_reduction: Dict[str, Any]
    pc_values: List[Dict[str, Any]]
    cluster_distribution: List[Dict[str, Any]]
    component_names: Dict[str, str]
    pca_prediction_link: List[Dict[str, Any]]


COMPONENT_NAME_MAP = {
    "Trend": "Trend Driver",
    "Volatility": "Volatility Axis",
    "Momentum": "Momentum Signal",
    "Market Structure": "Structure Lens",
}


def _feature_theme(feature: str) -> str:
    trend = {"Close", "Open", "High", "Low", "EMA_20", "SMA_20", "BB_upper", "BB_lower"}
    volatility = {"Volatility_20", "Returns"}
    momentum = {"RSI", "MACD"}

    if feature in trend:
        return "Trend"
    if feature in volatility:
        return "Volatility"
    if feature in momentum:
        return "Momentum"
    return "Market Structure"


def _interpret_pc_value(component_name: str, value: float) -> str:
    """Return a readable sentence for a live PC value."""
    if "Trend" in component_name:
        if value > 0.5:
            return "Strong bullish trend detected"
        if value < -0.5:
            return "Significant bearish pressure"
        return "Neutral trend environment"
    if "Volatility" in component_name:
        if value > 0.5:
            return "Elevated market turbulence"
        if value < -0.5:
            return "Unusually calm conditions"
        return "Normal volatility regime"
    if "Momentum" in component_name:
        if value > 0.3:
            return "Positive momentum building"
        if value < -0.3:
            return "Momentum fading"
        return "Momentum in equilibrium"
    if value > 0:
        return "Above-average structural reading"
    return "Below-average structural reading"


def _build_component_insights(request: Request) -> List[Dict[str, Any]]:
    pca = request.app.state.pca
    metadata = request.app.state.metadata
    interpretations = get_component_interpretation(
        pca=pca,
        feature_names=metadata["feature_names"],
        top_n=5,
    )

    output: List[Dict[str, Any]] = []
    for item in interpretations:
        top_features = [f["feature"] for f in item["top_features"][:3]]
        theme_counts: Dict[str, int] = {}
        for feature_name in top_features:
            theme = _feature_theme(feature_name)
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        dominant_theme = max(theme_counts, key=theme_counts.get) if theme_counts else "Market Structure"
        output.append(
            {
                "component": item["component"],
                "theme": dominant_theme,
                "top_features": top_features,
            }
        )

    return output


def _cluster_label(cluster_id: int, avg_return: float, volatility: float) -> str:
    if avg_return > 0 and volatility < 0.02:
        return "Growth"
    if abs(avg_return) <= 0.002 and volatility < 0.015:
        return "Stable"
    if volatility >= 0.02:
        return "Volatile"
    return f"Cluster {cluster_id}"


def _market_state(latest_return: float, latest_volatility: float, latest_pc1: float, latest_pc2: float) -> str:
    if latest_volatility >= 0.025 or latest_pc2 > 1.0:
        return "VOLATILE"
    if latest_pc1 > 0.5 and latest_return >= 0:
        return "BULLISH_TREND"
    if latest_pc1 < -0.5 and latest_return < 0:
        return "BEARISH_TREND"
    return "RANGE_BOUND"



def _run_analysis(frame, request: Request) -> Dict[str, Any]:
    scaler = request.app.state.scaler
    pca = request.app.state.pca
    kmeans = request.app.state.kmeans
    metadata = request.app.state.metadata

    features = engineer_features(frame)
    aligned = align_features(features, metadata["feature_names"])

    x_scaled = scaler.transform(aligned.values)
    x_pca = pca.transform(x_scaled)
    clusters = kmeans.predict(x_pca)

    if x_pca.shape[1] >= 2:
        points = x_pca[:, :2]
    elif x_pca.shape[1] == 1:
        points = np.column_stack([x_pca[:, 0], np.zeros(len(x_pca))])
    else:
        raise ValueError("PCA produced no components")

    cluster_comparison: List[Dict[str, Any]] = []
    cluster_ids = sorted({int(c) for c in clusters.tolist()})
    for cluster_id in cluster_ids:
        mask = clusters == cluster_id
        returns = aligned.loc[mask, "Returns"] if "Returns" in aligned.columns else pd.Series(dtype=float)
        vol = aligned.loc[mask, "Volatility_20"] if "Volatility_20" in aligned.columns else pd.Series(dtype=float)
        avg_return = float(returns.mean()) if not returns.empty else 0.0
        avg_volatility = float(vol.mean()) if not vol.empty else 0.0
        trend = "UP" if avg_return > 0 else ("DOWN" if avg_return < 0 else "SIDEWAYS")

        cluster_comparison.append(
            {
                "cluster": int(cluster_id),
                "label": _cluster_label(int(cluster_id), avg_return, avg_volatility),
                "count": int(mask.sum()),
                "avg_return": avg_return,
                "volatility": avg_volatility,
                "trend": trend,
            }
        )

    trajectory_points = points[-30:]
    trajectory_dates = aligned.index[-30:]
    trajectory_clusters = clusters[-30:]
    trajectory = [
        {
            "date": pd.Timestamp(dt).isoformat(),
            "pc1": float(xy[0]),
            "pc2": float(xy[1]),
            "cluster": int(cl),
        }
        for dt, xy, cl in zip(trajectory_dates, trajectory_points, trajectory_clusters)
    ]

    close_series = frame["Close"].tail(120)
    price_history = [
        {"date": pd.Timestamp(idx).isoformat(), "close": float(val)} for idx, val in close_series.items()
    ]

    explained = pca.explained_variance_ratio_.tolist()
    top3 = float(sum(explained[:3])) if explained else 0.0

    latest_return = float(aligned["Returns"].iloc[-1]) if "Returns" in aligned.columns else 0.0
    latest_volatility = float(aligned["Volatility_20"].iloc[-1]) if "Volatility_20" in aligned.columns else 0.0
    latest_pc1 = float(points[-1][0])
    latest_pc2 = float(points[-1][1])

    # --- New: cumulative variance ---
    cumulative_variance: List[float] = []
    running = 0.0
    for v in explained:
        running += v
        cumulative_variance.append(round(running, 6))

    # --- New: dimension reduction ---
    raw_feature_count = len(metadata["feature_names"])
    pca_component_count = pca.n_components_
    dimension_reduction = {
        "raw_features": raw_feature_count,
        "pca_components": int(pca_component_count),
        "reduction_pct": round((1 - pca_component_count / raw_feature_count) * 100, 1),
        "variance_retained": round(float(sum(explained)) * 100, 1),
    }

    # --- New: component weights ---
    pca_insights_list = _build_component_insights(request)
    component_weights: List[Dict[str, Any]] = []
    component_names: Dict[str, str] = {}
    for i, comp_weights in enumerate(pca.components_):
        comp_id = f"PC{i + 1}"
        pairs = sorted(
            zip(metadata["feature_names"], comp_weights.tolist()),
            key=lambda p: abs(p[1]),
            reverse=True,
        )
        # Determine theme for naming
        top_features = [p[0] for p in pairs[:3]]
        theme_counts: Dict[str, int] = {}
        for fname in top_features:
            theme = _feature_theme(fname)
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        dominant = max(theme_counts, key=theme_counts.get) if theme_counts else "Market Structure"
        human_name = COMPONENT_NAME_MAP.get(dominant, dominant)
        component_names[comp_id] = human_name

        component_weights.append({
            "component": comp_id,
            "name": human_name,
            "features": [{"feature": name, "weight": round(float(w), 4)} for name, w in pairs],
        })

    # --- New: live PC values with interpretation ---
    latest_pc = x_pca[-1]
    pc_values: List[Dict[str, Any]] = []
    for i in range(min(len(latest_pc), len(component_weights))):
        comp_id = f"PC{i + 1}"
        val = float(latest_pc[i])
        name = component_names.get(comp_id, comp_id)
        pc_values.append({
            "component": comp_id,
            "name": name,
            "value": round(val, 4),
            "variance_pct": round(explained[i] * 100, 1) if i < len(explained) else 0.0,
            "interpretation": _interpret_pc_value(name, val),
        })

    # --- New: cluster distribution ---
    total = len(clusters)
    cluster_distribution: List[Dict[str, Any]] = []
    for entry in cluster_comparison:
        cluster_distribution.append({
            "cluster": entry["cluster"],
            "label": entry["label"],
            "count": entry["count"],
            "percentage": round(entry["count"] / total * 100, 1) if total else 0.0,
        })

    # --- New: PCA → prediction link ---
    pca_prediction_link: List[Dict[str, Any]] = []
    for pv in pc_values[:3]:
        direction = "positive" if pv["value"] > 0 else "negative"
        strength = "strong" if abs(pv["value"]) > 0.5 else "moderate" if abs(pv["value"]) > 0.2 else "weak"
        impact = "bullish" if pv["value"] > 0 else "bearish"
        pca_prediction_link.append({
            "component": pv["component"],
            "name": pv["name"],
            "value": pv["value"],
            "direction": direction,
            "strength": strength,
            "impact": impact,
            "explanation": f"{pv['name']} ({pv['component']}) shows {strength} {direction} signal → {impact} pressure on prediction",
        })

    return {
        "pca_points": points.tolist(),
        "clusters": [int(c) for c in clusters.tolist()],
        "explained_variance": explained,
        "latest_cluster": int(clusters[-1]),
        "pca_insights": pca_insights_list,
        "trajectory": trajectory,
        "price_history": price_history,
        "cluster_comparison": cluster_comparison,
        "market_state": _market_state(latest_return, latest_volatility, latest_pc1, latest_pc2),
        "variance_story": f"Top 3 components explain {top3 * 100:.1f}% of market behavior.",
        # New fields
        "component_weights": component_weights,
        "cumulative_variance": cumulative_variance,
        "dimension_reduction": dimension_reduction,
        "pc_values": pc_values,
        "cluster_distribution": cluster_distribution,
        "component_names": component_names,
        "pca_prediction_link": pca_prediction_link,
    }


@router.post("/analyze-stock", response_model=AnalyzeResponse)
def analyze_stock(payload: SymbolRequest, request: Request) -> AnalyzeResponse:
    symbol = payload.symbol.strip().upper()
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol required")

    try:
        fetched = fetch_stock_data(symbol)

        # Feature engineering expects OHLCV columns. Keep DatetimeIndex if present.
        frame = fetched.copy()
        date_col = "Date" if "Date" in frame.columns else ("Datetime" if "Datetime" in frame.columns else None)
        if date_col is not None:
            frame[date_col] = pd.to_datetime(frame[date_col])
            frame = frame.set_index(date_col)

        result = _run_analysis(frame=frame, request=request)
        
        # Convert index keys to strings to satisfy Pydantic validation
        raw_sample = fetched.head(5).to_dict()
        safe_sample = {
            col: {str(k): v for k, v in data.items()}
            for col, data in raw_sample.items()
        }

        result.update(
            {
                "rows": int(len(fetched)),
                "columns": [str(c) for c in fetched.columns.tolist()],
                "sample": safe_sample,
            }
        )
        return AnalyzeResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/analyze-stock-csv", response_model=AnalyzeResponse)
async def analyze_stock_csv(request: Request, file: UploadFile = File(...)) -> AnalyzeResponse:
    try:
        content = await file.read()
        frame = load_stock_csv(content)
        result = _run_analysis(frame=frame, request=request)
        sample_df = frame.reset_index().head(5)
        raw_sample = sample_df.to_dict()
        safe_sample = {
            col: {str(k): v for k, v in data.items()}
            for col, data in raw_sample.items()
        }

        result.update(
            {
                "rows": int(len(frame)),
                "columns": [str(c) for c in sample_df.columns.tolist()],
                "sample": safe_sample,
            }
        )
        return AnalyzeResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
