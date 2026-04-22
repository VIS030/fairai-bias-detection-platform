"""
Analysis Router: Runs bias detection, computes fairness metrics, and applies mitigation.
"""
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import AnalysisResult
from services.ml_pipeline import MLPipeline
from services.bias_mitigation import BiasMitigation
from routers.dataset import get_current_dataset

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

# Store pipeline state for reuse across endpoints
pipeline_state = {
    "pipeline": None,
    "dataset_summary": None,
    "model_metrics": None,
    "bias_metrics": None,
    "group_metrics": None,
    "feature_importance": None,
    "mitigation_results": None,
}


@router.post("/run")
async def run_analysis(
    target_column: str = "income",
    sensitive_column: str = "sex",
    db: Session = Depends(get_db)
):
    """Run the full bias detection pipeline."""
    dataset = get_current_dataset()
    if dataset["df"] is None:
        return {"success": False, "message": "No dataset loaded. Please upload or load a demo dataset first."}

    df = dataset["df"].copy()

    # Initialize pipeline
    pipeline = MLPipeline()

    # Step 1: Preprocess
    try:
        dataset_summary = pipeline.preprocess_data(df, target_column, sensitive_column)
    except Exception as e:
        return {"success": False, "message": f"Preprocessing failed: {str(e)}"}

    # Step 2: Train model
    try:
        model_metrics = pipeline.train_model()
    except Exception as e:
        return {"success": False, "message": f"Model training failed: {str(e)}"}

    # Step 3: Compute bias metrics
    try:
        bias_result = pipeline.compute_bias_metrics()
    except Exception as e:
        return {"success": False, "message": f"Bias computation failed: {str(e)}"}

    # Step 4: Feature importance
    feature_importance = pipeline.get_feature_importance()

    # Store state
    pipeline_state["pipeline"] = pipeline
    pipeline_state["dataset_summary"] = dataset_summary
    pipeline_state["model_metrics"] = model_metrics
    pipeline_state["bias_metrics"] = bias_result
    pipeline_state["group_metrics"] = bias_result["group_metrics"]
    pipeline_state["feature_importance"] = feature_importance
    pipeline_state["mitigation_results"] = None

    # Save to database
    try:
        result = AnalysisResult(
            dataset_name=dataset["info"]["name"],
            total_records=dataset_summary["total_records"],
            target_column=target_column,
            sensitive_column=sensitive_column,
            model_accuracy=model_metrics["accuracy"],
            precision=model_metrics["precision"],
            recall=model_metrics["recall"],
            f1_score=model_metrics["f1_score"],
            demographic_parity_diff=bias_result["demographic_parity_difference"],
            equalized_odds_diff=bias_result["equalized_odds_difference"],
            group_metrics=json.dumps(bias_result["group_metrics"]),
            feature_importance=json.dumps(feature_importance),
        )
        db.add(result)
        db.commit()
    except Exception:
        pass  # Non-critical: analysis still works without DB persistence

    return {
        "success": True,
        "message": "Bias analysis completed successfully.",
        "dataset_summary": dataset_summary,
        "model_metrics": model_metrics,
        "bias_metrics": {
            "demographic_parity_difference": bias_result["demographic_parity_difference"],
            "equalized_odds_difference": bias_result["equalized_odds_difference"],
        },
        "group_metrics": bias_result["group_metrics"],
        "feature_importance": feature_importance,
    }


@router.get("/results")
async def get_results():
    """Get the latest analysis results."""
    if pipeline_state["pipeline"] is None:
        return {"success": False, "message": "No analysis has been run yet."}

    return {
        "success": True,
        "dataset_summary": pipeline_state["dataset_summary"],
        "model_metrics": pipeline_state["model_metrics"],
        "bias_metrics": pipeline_state["bias_metrics"],
        "group_metrics": pipeline_state["group_metrics"],
        "feature_importance": pipeline_state["feature_importance"],
        "mitigation_results": pipeline_state["mitigation_results"],
    }


@router.post("/mitigate")
async def apply_mitigation(db: Session = Depends(get_db)):
    """Apply bias mitigation using ExponentiatedGradient."""
    pipeline = pipeline_state["pipeline"]
    if pipeline is None:
        return {"success": False, "message": "Run analysis first before applying mitigation."}

    X_train, X_test, y_train, y_test, sensitive_train, sensitive_test = pipeline.get_test_data()

    mitigator = BiasMitigation()
    try:
        results = mitigator.apply_mitigation(
            X_train, X_test, y_train, y_test,
            sensitive_train, sensitive_test,
            label_encoders=pipeline.label_encoders
        )
    except Exception as e:
        return {"success": False, "message": f"Mitigation failed: {str(e)}"}

    pipeline_state["mitigation_results"] = results

    # Update DB record
    try:
        latest = db.query(AnalysisResult).order_by(
            AnalysisResult.id.desc()
        ).first()
        if latest:
            latest.mitigated_demographic_parity = results["after"]["demographic_parity_difference"]
            latest.mitigated_equalized_odds = results["after"]["equalized_odds_difference"]
            latest.mitigated_accuracy = results["after"]["accuracy"]
            db.commit()
    except Exception:
        pass

    return {
        "success": True,
        "message": "Bias mitigation applied successfully.",
        "before": results["before"],
        "after": results["after"],
        "before_groups": results["before_groups"],
        "after_groups": results["after_groups"],
        "improvement": results["improvement"],
    }
