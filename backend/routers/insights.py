"""
Insights Router: Generates AI-powered insights from analysis results.
"""
from fastapi import APIRouter
from services.insights_engine import InsightsEngine
from routers.analysis import pipeline_state

router = APIRouter(prefix="/api/insights", tags=["Insights"])

insights_engine = InsightsEngine()


@router.get("")
async def get_insights():
    """Get AI-generated insights based on the latest analysis."""
    if pipeline_state["pipeline"] is None:
        return {
            "success": False,
            "message": "No analysis has been run yet. Please run bias analysis first.",
            "insights": [],
        }

    analysis_data = {
        "dataset_summary": pipeline_state.get("dataset_summary", {}),
        "bias_metrics": pipeline_state.get("bias_metrics", {}),
        "group_metrics": pipeline_state.get("group_metrics", []),
        "feature_importance": pipeline_state.get("feature_importance", {}),
        "model_metrics": pipeline_state.get("model_metrics", {}),
    }

    insights = insights_engine.generate_insights(analysis_data)

    # Compute bias summary
    bias_metrics = pipeline_state.get("bias_metrics", {})
    dpd = abs(bias_metrics.get("demographic_parity_difference", 0))
    eod = abs(bias_metrics.get("equalized_odds_difference", 0))

    # Overall fairness score (0-100, higher is fairer)
    fairness_score = max(0, min(100, int((1 - (dpd + eod) / 2) * 100)))

    if fairness_score >= 80:
        rating = "Good"
    elif fairness_score >= 60:
        rating = "Moderate"
    elif fairness_score >= 40:
        rating = "Poor"
    else:
        rating = "Critical"

    bias_summary = {
        "fairness_score": fairness_score,
        "rating": rating,
        "total_insights": len(insights),
        "high_severity": len([i for i in insights if i["severity"] == "high"]),
        "medium_severity": len([i for i in insights if i["severity"] == "medium"]),
        "low_severity": len([i for i in insights if i["severity"] == "low"]),
    }

    return {
        "success": True,
        "insights": insights,
        "bias_summary": bias_summary,
    }
