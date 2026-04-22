"""
Dataset Router: Handles CSV upload, demo dataset loading, and dataset info.
"""
import os
import json
import shutil
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import DatasetInfo

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

# Global state for current dataset
current_dataset = {"df": None, "info": None}

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
DEMO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "adult.csv")


def get_current_dataset():
    """Get the current loaded dataset."""
    return current_dataset


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a CSV file as the working dataset."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save uploaded file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Read and validate
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {str(e)}")

    # Store in global state
    current_dataset["df"] = df
    current_dataset["info"] = {
        "name": file.filename,
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": df.columns.tolist(),
        "is_demo": False,
    }

    # Save to database
    db_info = DatasetInfo(
        name=file.filename,
        file_path=file_path,
        total_rows=len(df),
        total_columns=len(df.columns),
        columns=json.dumps(df.columns.tolist()),
        is_demo=0,
    )
    db.add(db_info)
    db.commit()
    db.refresh(db_info)

    return {
        "success": True,
        "message": f"Dataset '{file.filename}' uploaded successfully.",
        "dataset_id": db_info.id,
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": df.columns.tolist(),
    }


@router.post("/demo")
async def load_demo_dataset(db: Session = Depends(get_db)):
    """Load the preloaded adult.csv demo dataset."""
    if not os.path.exists(DEMO_PATH):
        raise HTTPException(status_code=404, detail="Demo dataset not found.")

    try:
        df = pd.read_csv(DEMO_PATH)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read demo dataset: {str(e)}")

    current_dataset["df"] = df
    current_dataset["info"] = {
        "name": "adult.csv (Demo)",
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": df.columns.tolist(),
        "is_demo": True,
    }

    # Save to database
    db_info = DatasetInfo(
        name="adult.csv (Demo)",
        file_path=DEMO_PATH,
        total_rows=len(df),
        total_columns=len(df.columns),
        columns=json.dumps(df.columns.tolist()),
        is_demo=1,
    )
    db.add(db_info)
    db.commit()

    return {
        "success": True,
        "message": "Demo dataset loaded successfully.",
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": df.columns.tolist(),
    }


@router.get("/info")
async def get_dataset_info():
    """Get info about the currently loaded dataset."""
    if current_dataset["df"] is None:
        return {"success": False, "message": "No dataset loaded."}

    df = current_dataset["df"]
    info = current_dataset["info"]

    # Compute basic stats
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

    return {
        "success": True,
        "info": info,
        "stats": {
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "missing_values": int(df.isnull().sum().sum()),
            "duplicate_rows": int(df.duplicated().sum()),
        }
    }


@router.get("/preview")
async def preview_dataset(rows: int = 10):
    """Get first N rows of the current dataset."""
    if current_dataset["df"] is None:
        return {"success": False, "message": "No dataset loaded."}

    df = current_dataset["df"]
    preview = df.head(rows).to_dict(orient="records")

    return {
        "success": True,
        "columns": df.columns.tolist(),
        "data": preview,
        "total_rows": len(df),
    }
