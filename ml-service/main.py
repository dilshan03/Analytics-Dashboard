"""
main.py
──────────────────────────────────────────────────────────────────────────────
FastAPI ML Microservice for the Analytics Dashboard.

Endpoints:
  GET  /health                          → service health check
  POST /train                           → train / retrain the model
  GET  /model-info                      → model metadata & R² scores
  GET  /forecast/jobs                   → multi-year job demand forecast
  GET  /forecast/skills                 → multi-year skill demand forecast
  GET  /feature-importance              → RF feature importance weights
  GET  /available                       → list all known roles / skills / industries

All endpoints return JSON.
Starts on port 8000.  Node backend proxies to http://localhost:8000.
──────────────────────────────────────────────────────────────────────────────
"""

from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from model import forecaster


# ── Startup: auto-train on launch ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 ML Service starting — training model...")
    result = forecaster.train()
    print(
        f"✅ Model trained  |  "
        f"Job R²={result['job_r2']:.3f}  |  "
        f"Skill R²={result['skill_r2']:.3f}  |  "
        f"Samples: {result['job_samples']} jobs, {result['skill_samples']} skills"
    )
    yield
    print("🛑 ML Service shutting down.")


app = FastAPI(
    title="Analytics Dashboard — ML Service",
    version="1.0.0",
    description="Random Forest demand forecasting for jobs & skills",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_trained": forecaster.trained,
    }


# ── Retrain ──────────────────────────────────────────────────────────────────
@app.post("/train")
def train_model():
    """Force retrain the model (e.g., after seeding new data)."""
    result = forecaster.train()
    return {"message": "Model trained successfully", **result}


# ── Model metadata ───────────────────────────────────────────────────────────
@app.get("/model-info")
def model_info():
    return forecaster.model_info()


# ── Job forecast ─────────────────────────────────────────────────────────────
@app.get("/forecast/jobs")
def forecast_jobs(
    role: str = Query(..., description="Job role name, e.g. 'Data Scientist'"),
    industry: Optional[str] = Query("IT", description="Industry, e.g. 'Finance'"),
    years: int = Query(5, ge=1, le=10, description="Forecast horizon (years)"),
):
    """
    Returns multi-year demand forecast for the given role.
    Example: GET /forecast/jobs?role=Data+Scientist&industry=IT&years=5
    """
    if not forecaster.trained:
        raise HTTPException(status_code=503, detail="Model not yet trained.")

    available = forecaster.available_roles()
    if role not in available:
        raise HTTPException(
            status_code=404,
            detail=f"Role '{role}' not found. Available: {available}",
        )

    predictions = forecaster.predict_jobs(role, industry or "IT", years)

    return {
        "role": role,
        "industry": industry or "IT",
        "forecastYears": years,
        "model": "RandomForest",
        "r2": forecaster.job_r2,
        "predictions": predictions,
    }


# ── Skill forecast ───────────────────────────────────────────────────────────
@app.get("/forecast/skills")
def forecast_skills(
    skill: str = Query(..., description="Skill name, e.g. 'Python'"),
    years: int = Query(5, ge=1, le=10, description="Forecast horizon (years)"),
):
    """
    Returns multi-year demand forecast for the given skill.
    Example: GET /forecast/skills?skill=Python&years=5
    """
    if not forecaster.trained:
        raise HTTPException(status_code=503, detail="Model not yet trained.")

    available = forecaster.available_skills()
    if skill not in available:
        raise HTTPException(
            status_code=404,
            detail=f"Skill '{skill}' not found. Available: {available}",
        )

    predictions = forecaster.predict_skills(skill, years)

    return {
        "skill": skill,
        "forecastYears": years,
        "model": "RandomForest",
        "r2": forecaster.skill_r2,
        "predictions": predictions,
    }


# ── Feature importance ───────────────────────────────────────────────────────
@app.get("/feature-importance")
def feature_importance():
    """Returns feature importance scores from both RF models."""
    if not forecaster.trained:
        raise HTTPException(status_code=503, detail="Model not yet trained.")
    return forecaster.feature_importance()


# ── Available entities ───────────────────────────────────────────────────────
@app.get("/available")
def available_entities():
    """Returns all roles, skills, and industries known to the model."""
    return {
        "roles": forecaster.available_roles(),
        "skills": forecaster.available_skills(),
        "industries": forecaster.available_industries(),
    }


# ── Run directly ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
