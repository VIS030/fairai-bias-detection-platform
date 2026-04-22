"""
SQLAlchemy models for FairAI database.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from database import Base


class AnalysisResult(Base):
    """Stores bias analysis results."""
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_name = Column(String(255), nullable=False)
    total_records = Column(Integer)
    target_column = Column(String(100))
    sensitive_column = Column(String(100))

    # Model metrics
    model_accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)

    # Bias metrics (before mitigation)
    demographic_parity_diff = Column(Float)
    equalized_odds_diff = Column(Float)

    # Bias metrics (after mitigation)
    mitigated_demographic_parity = Column(Float)
    mitigated_equalized_odds = Column(Float)
    mitigated_accuracy = Column(Float)

    # Group-level data stored as JSON
    group_metrics = Column(Text)  # JSON string
    feature_importance = Column(Text)  # JSON string
    insights = Column(Text)  # JSON string

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DatasetInfo(Base):
    """Stores metadata about uploaded/loaded datasets."""
    __tablename__ = "dataset_info"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    file_path = Column(String(500))
    total_rows = Column(Integer)
    total_columns = Column(Integer)
    columns = Column(Text)  # JSON string of column names
    is_demo = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
