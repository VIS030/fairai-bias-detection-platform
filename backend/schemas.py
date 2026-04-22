"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DatasetUploadResponse(BaseModel):
    success: bool
    message: str
    dataset_id: Optional[int] = None
    total_rows: Optional[int] = None
    total_columns: Optional[int] = None
    columns: Optional[List[str]] = None


class DatasetInfoResponse(BaseModel):
    id: int
    name: str
    total_rows: int
    total_columns: int
    columns: List[str]
    is_demo: bool


class AnalysisRequest(BaseModel):
    target_column: str = "income"
    sensitive_column: str = "sex"


class GroupMetric(BaseModel):
    group: str
    positive_rate: float
    count: int
    positive_count: int


class BiasMetrics(BaseModel):
    demographic_parity_difference: float
    equalized_odds_difference: float
    model_accuracy: float
    precision: float
    recall: float
    f1_score: float


class MitigationResult(BaseModel):
    before: BiasMetrics
    after: BiasMetrics
    improvement: Dict[str, float]
    group_metrics_before: List[GroupMetric]
    group_metrics_after: List[GroupMetric]


class AnalysisResponse(BaseModel):
    success: bool
    message: str
    bias_metrics: Optional[BiasMetrics] = None
    group_metrics: Optional[List[GroupMetric]] = None
    feature_importance: Optional[Dict[str, float]] = None
    dataset_summary: Optional[Dict[str, Any]] = None


class InsightItem(BaseModel):
    title: str
    description: str
    severity: str  # "high", "medium", "low", "info"
    category: str  # "imbalance", "bias", "feature", "recommendation"
    icon: str


class InsightsResponse(BaseModel):
    success: bool
    insights: List[InsightItem]
    bias_summary: Optional[Dict[str, Any]] = None
