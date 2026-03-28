"""
model.py
──────────────────────────────────────────────────────────────────────────────
JobDemandForecaster
  • Trains a RandomForestRegressor on augmented job/skill time-series data
  • Features: year, role_encoded, industry_encoded, salarymid
  • Cross-validates with KFold(5) to produce a reliable R² confidence score
  • Exposes: train(), predict_jobs(role, industry, years),
             predict_skills(skill, years), feature_importance()
──────────────────────────────────────────────────────────────────────────────
"""

import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import LabelEncoder

from data_loader import build_jobs_dataframe, build_skills_dataframe


class JobDemandForecaster:
    def __init__(self):
        # Models
        self.job_model: RandomForestRegressor | None = None
        self.skill_model: RandomForestRegressor | None = None

        # Encoders
        self.role_enc = LabelEncoder()
        self.industry_enc = LabelEncoder()
        self.category_enc = LabelEncoder()
        self.skill_enc = LabelEncoder()

        # DataFrames used for prediction context
        self.jobs_df: pd.DataFrame | None = None
        self.skills_df: pd.DataFrame | None = None

        # Confidence scores (R²)
        self.job_r2: float = 0.0
        self.skill_r2: float = 0.0

        # Feature importance
        self.job_feature_names = ["year", "role", "industry", "salary_mid"]
        self.skill_feature_names = ["year", "skill", "category"]

        self.trained = False

    # ── TRAINING ────────────────────────────────────────────────────────────

    def train(self):
        """Train both the job model and the skill model."""
        self._train_job_model()
        self._train_skill_model()
        self.trained = True
        return {
            "job_r2": round(self.job_r2, 4),
            "skill_r2": round(self.skill_r2, 4),
            "job_samples": len(self.jobs_df),
            "skill_samples": len(self.skills_df),
        }

    def _train_job_model(self):
        df = build_jobs_dataframe()
        self.jobs_df = df

        # Encode categoricals
        df["role_enc"] = self.role_enc.fit_transform(df["role"])
        df["industry_enc"] = self.industry_enc.fit_transform(df["industry"])

        X = df[["year", "role_enc", "industry_enc", "salarymid"]].values
        y = df["demandCount"].values

        self.job_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        )

        # 5-fold cross-validation for honest R²
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(self.job_model, X, y, cv=kf, scoring="r2")
        self.job_r2 = float(np.mean(scores))

        # Final fit on all data
        self.job_model.fit(X, y)

    def _train_skill_model(self):
        df = build_skills_dataframe()
        self.skills_df = df

        df["skill_enc"] = self.skill_enc.fit_transform(df["skill"])
        df["category_enc"] = self.category_enc.fit_transform(df["category"])

        X = df[["year", "skill_enc", "category_enc"]].values
        y = df["demandCount"].values

        self.skill_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=8,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        )

        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(self.skill_model, X, y, cv=kf, scoring="r2")
        self.skill_r2 = float(np.mean(scores))

        self.skill_model.fit(X, y)

    # ── JOB FORECAST ────────────────────────────────────────────────────────

    def predict_jobs(self, role: str, industry: str = "IT", horizon: int = 5) -> list[dict]:
        """
        Predict job demand for the next `horizon` years.
        Returns a list of {year, predictedDemand, confidence}.
        """
        if not self.trained:
            raise RuntimeError("Model not trained yet. Call train() first.")

        # Validate role
        known_roles = list(self.role_enc.classes_)
        if role not in known_roles:
            raise ValueError(f"Unknown role '{role}'. Known: {known_roles}")

        # Validate industry
        known_industries = list(self.industry_enc.classes_)
        if industry not in known_industries:
            industry = "IT"  # default fallback

        role_enc = int(self.role_enc.transform([role])[0])
        industry_enc = int(self.industry_enc.transform([industry])[0])

        # Get latest salary_mid as a proxy
        role_rows = self.jobs_df[
            (self.jobs_df["role"] == role) & (self.jobs_df["industry"] == industry)
        ]
        if role_rows.empty:
            role_rows = self.jobs_df[self.jobs_df["role"] == role]

        salary_mid = float(role_rows["salarymid"].iloc[-1]) if not role_rows.empty else 2000.0
        last_year = int(role_rows["year"].max()) if not role_rows.empty else 2024

        # Calculate historical trend (CAGR) to allow the Random Forest to extrapolate
        recent = role_rows.sort_values("year").tail(4)
        if len(recent) >= 2 and recent.iloc[0]["demandCount"] > 0:
            past_val = float(recent.iloc[0]["demandCount"])
            curr_val = float(recent.iloc[-1]["demandCount"])
            years_span = float(recent.iloc[-1]["year"] - recent.iloc[0]["year"])
            trend = (curr_val / past_val) ** (1.0 / max(1.0, years_span)) - 1.0
        else:
            trend = 0.02 # default 2% growth

        # Determine the forecasting start point (always relative to the CURRENT year)
        current_year = datetime.datetime.now().year
        start_year = max(last_year, current_year)

        results = []
        for i in range(1, horizon + 1):
            target_year = start_year + i
            
            # Predict using RF on the latest known year
            X = np.array([[last_year, role_enc, industry_enc, salary_mid]])
            base_pred = float(self.job_model.predict(X)[0])
            
            # Apply time-series trend extrapolation linking last_year to target_year
            diff_years = target_year - last_year
            extrapolated = base_pred * ((1 + trend) ** diff_years)
            pred = max(0, int(round(extrapolated)))
            
            results.append({
                "year": target_year,
                "predictedDemand": pred,
                "confidence": round(max(0.0, self.job_r2) * 100, 1),
            })

        return results

    # ── SKILL FORECAST ────────────────────────────────────────────────────────

    def predict_skills(self, skill: str, horizon: int = 5) -> list[dict]:
        """
        Predict skill demand for the next `horizon` years.
        Returns a list of {year, predictedDemand, confidence}.
        """
        if not self.trained:
            raise RuntimeError("Model not trained yet. Call train() first.")

        known_skills = list(self.skill_enc.classes_)
        if skill not in known_skills:
            raise ValueError(f"Unknown skill '{skill}'. Known: {known_skills}")

        skill_enc = int(self.skill_enc.transform([skill])[0])

        skill_rows = self.skills_df[self.skills_df["skill"] == skill]
        cat = skill_rows["category"].iloc[0] if not skill_rows.empty else "Programming"
        category_enc = int(self.category_enc.transform([cat])[0])
        last_year = int(skill_rows["year"].max()) if not skill_rows.empty else 2024

        # Calculate historical trend to allow the Random Forest to extrapolate
        recent = skill_rows.sort_values("year").tail(4)
        if len(recent) >= 2 and recent.iloc[0]["demandCount"] > 0:
            past_val = float(recent.iloc[0]["demandCount"])
            curr_val = float(recent.iloc[-1]["demandCount"])
            years_span = float(recent.iloc[-1]["year"] - recent.iloc[0]["year"])
            trend = (curr_val / past_val) ** (1.0 / max(1.0, years_span)) - 1.0
        else:
            trend = 0.02 # default 2% growth

        # Determine the forecasting start point
        current_year = datetime.datetime.now().year
        start_year = max(last_year, current_year)

        results = []
        for i in range(1, horizon + 1):
            target_year = start_year + i
            
            # Predict using RF on the latest known year
            X = np.array([[last_year, skill_enc, category_enc]])
            base_pred = float(self.skill_model.predict(X)[0])
            
            # Apply time-series trend extrapolation linking last_year to target_year
            diff_years = target_year - last_year
            extrapolated = base_pred * ((1 + trend) ** diff_years)
            pred = max(0, int(round(extrapolated)))
            
            results.append({
                "year": target_year,
                "predictedDemand": pred,
                "confidence": round(max(0.0, self.skill_r2) * 100, 1),
            })

        return results

    # ── FEATURE IMPORTANCE ──────────────────────────────────────────────────

    def feature_importance(self) -> dict:
        """Return feature importance scores for both models."""
        if not self.trained:
            raise RuntimeError("Model not trained yet.")

        job_imp = self.job_model.feature_importances_
        skill_imp = self.skill_model.feature_importances_

        return {
            "jobs": [
                {"feature": name, "importance": round(float(imp), 4)}
                for name, imp in zip(self.job_feature_names, job_imp)
            ],
            "skills": [
                {"feature": name, "importance": round(float(imp), 4)}
                for name, imp in zip(self.skill_feature_names, skill_imp)
            ],
        }

    # ── AVAILABLE ROLES / SKILLS ─────────────────────────────────────────────

    def available_roles(self) -> list[str]:
        return sorted(list(self.role_enc.classes_)) if self.trained else []

    def available_industries(self) -> list[str]:
        return sorted(list(self.industry_enc.classes_)) if self.trained else []

    def available_skills(self) -> list[str]:
        return sorted(list(self.skill_enc.classes_)) if self.trained else []

    def model_info(self) -> dict:
        return {
            "trained": self.trained,
            "job_r2": round(self.job_r2, 4),
            "skill_r2": round(self.skill_r2, 4),
            "job_samples": len(self.jobs_df) if self.jobs_df is not None else 0,
            "skill_samples": len(self.skills_df) if self.skills_df is not None else 0,
            "algorithm": "RandomForestRegressor (n=200, KFold-5)",
        }


# ── Singleton instance shared across requests ─────────────────────────────
forecaster = JobDemandForecaster()
