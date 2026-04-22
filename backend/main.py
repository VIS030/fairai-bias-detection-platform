"""
FairAI Backend – Main FastAPI Application
Bias Detection & Correction Platform
"""
import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import dataset, analysis, insights

app = FastAPI(
    title="FairAI – Bias Detection & Correction Platform",
    description="API for detecting and mitigating bias in ML datasets using Fairlearn",
    version="1.0.0",
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dataset.router)
app.include_router(analysis.router)
app.include_router(insights.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    print("[OK] FairAI Backend started successfully!")
    print("[DB] Database initialized.")


@app.get("/")
async def root():
    return {
        "name": "FairAI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
