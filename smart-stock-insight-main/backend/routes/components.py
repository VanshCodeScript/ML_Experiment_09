from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Request
from pydantic import BaseModel

from backend.services.pca_service import get_component_interpretation

router = APIRouter(tags=["components"])


class ComponentsResponse(BaseModel):
    components: List[List[float]]
    feature_importance: List[float]
    interpretations: List[Dict[str, Any]]


@router.get("/get-components", response_model=ComponentsResponse)
def get_components(request: Request) -> ComponentsResponse:
    pca = request.app.state.pca
    predictor = request.app.state.predictor
    metadata = request.app.state.metadata

    interpretations = get_component_interpretation(
        pca=pca,
        feature_names=metadata["feature_names"],
        top_n=5,
    )

    return ComponentsResponse(
        components=pca.components_.tolist(),
        feature_importance=predictor.feature_importances_.tolist(),
        interpretations=interpretations,
    )
