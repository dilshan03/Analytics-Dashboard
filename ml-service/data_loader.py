"""
data_loader.py
──────────────────────────────────────────────────────────────────────────────
Loads job and skill data from the static JSON export and augments it into a
training-ready DataFrame (~500 rows) for the Random Forest model.

Augmentation strategy:
  • Extends history back to 2018–2019 using linear backcast
  • Adds Finance / Healthcare / Education industry variants
  • Applies controlled noise (±5%) for realistic variance
──────────────────────────────────────────────────────────────────────────────
"""

import json
import os
import random
import numpy as np
import pandas as pd

# ── Path to the shared data file exported from backend ─────────────────────
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "market_data.json")

# ── Industry multipliers (demand relative to IT baseline) ───────────────────
INDUSTRY_MULTIPLIERS = {
    "IT":          1.00,
    "Finance":     0.85,
    "Healthcare":  0.70,
    "Education":   0.55,
    "Retail":      0.45,
}

# ── Salary multipliers per industry ─────────────────────────────────────────
SALARY_MULTIPLIERS = {
    "IT":          1.00,
    "Finance":     1.10,
    "Healthcare":  0.90,
    "Education":   0.75,
    "Retail":      0.65,
}

random.seed(42)
np.random.seed(42)


def _add_noise(value: float, pct: float = 0.05) -> int:
    """Apply ±pct% noise to a value and return as int."""
    noise = random.uniform(-pct, pct)
    return max(0, int(round(value * (1 + noise))))


def load_raw_data() -> dict:
    """Load the JSON data file. Returns {"jobs": [...], "skills": [...]}."""
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def build_jobs_dataframe() -> pd.DataFrame:
    """
    Build the augmented jobs training DataFrame.
    Columns: role, industry, year, demandCount, salaryMin, salaryMax, salarymid
    """
    raw = load_raw_data()
    base_jobs = raw["jobs"]

    records = []

    # ── Step 1: Add base IT records from the existing data ──────────────────
    for job in base_jobs:
        records.append({
            "role":        job["role"],
            "industry":    job["industry"],
            "year":        job["year"],
            "demandCount": job["demandCount"],
            "salaryMin":   job["salaryMin"],
            "salaryMax":   job["salaryMax"],
        })

    # ── Step 2: Backcast to 2018–2019 using simple linear extrapolation ─────
    # Group by role to find the slope
    df_base = pd.DataFrame(records)
    for role in df_base["role"].unique():
        role_df = df_base[df_base["role"] == role].sort_values("year")
        if len(role_df) < 2:
            continue

        # Use first two years to calculate backcast slope
        y1, d1 = role_df.iloc[0]["year"], role_df.iloc[0]["demandCount"]
        y2, d2 = role_df.iloc[1]["year"], role_df.iloc[1]["demandCount"]
        slope_d = (d2 - d1) / (y2 - y1)

        sal_min_2020 = role_df.iloc[0]["salaryMin"]
        sal_max_2020 = role_df.iloc[0]["salaryMax"]
        sal_min_slope = (role_df.iloc[1]["salaryMin"] - sal_min_2020) / (y2 - y1)
        sal_max_slope = (role_df.iloc[1]["salaryMax"] - sal_max_2020) / (y2 - y1)

        for back_year in [2018, 2019]:
            diff = back_year - y1
            demand = max(10, int(round(d1 + slope_d * diff * 0.8)))  # 0.8 dampens backcast
            sal_min = max(500, int(round(sal_min_2020 + sal_min_slope * diff * 0.9)))
            sal_max = max(800, int(round(sal_max_2020 + sal_max_slope * diff * 0.9)))
            records.append({
                "role":        role,
                "industry":    "IT",
                "year":        back_year,
                "demandCount": _add_noise(demand),
                "salaryMin":   sal_min,
                "salaryMax":   sal_max,
            })

    # ── Step 3: Create cross-industry variants ──────────────────────────────
    it_records = [r for r in records if r["industry"] == "IT"]
    for rec in it_records:
        for industry, demand_mult in INDUSTRY_MULTIPLIERS.items():
            if industry == "IT":
                continue
            sal_mult = SALARY_MULTIPLIERS[industry]
            records.append({
                "role":        rec["role"],
                "industry":    industry,
                "year":        rec["year"],
                "demandCount": _add_noise(rec["demandCount"] * demand_mult),
                "salaryMin":   int(round(rec["salaryMin"] * sal_mult)),
                "salaryMax":   int(round(rec["salaryMax"] * sal_mult)),
            })

    df = pd.DataFrame(records)
    df["salarymid"] = (df["salaryMin"] + df["salaryMax"]) / 2
    df = df.drop_duplicates(subset=["role", "industry", "year"])
    df = df.sort_values(["role", "industry", "year"]).reset_index(drop=True)

    return df


def build_skills_dataframe() -> pd.DataFrame:
    """
    Build the augmented skills training DataFrame.
    Columns: skill, category, year, demandCount
    """
    raw = load_raw_data()
    base_skills = raw["skills"]

    records = []

    # ── Base records ─────────────────────────────────────────────────────────
    for s in base_skills:
        records.append({
            "skill":       s["skill"],
            "category":    s["category"],
            "year":        s["year"],
            "demandCount": s["demandCount"],
        })

    # ── Backcast to 2018–2019 ────────────────────────────────────────────────
    df_base = pd.DataFrame(records)
    for skill in df_base["skill"].unique():
        skill_df = df_base[df_base["skill"] == skill].sort_values("year")
        if len(skill_df) < 2:
            continue

        y1, d1 = skill_df.iloc[0]["year"], skill_df.iloc[0]["demandCount"]
        y2, d2 = skill_df.iloc[1]["year"], skill_df.iloc[1]["demandCount"]
        slope = (d2 - d1) / (y2 - y1)
        cat = skill_df.iloc[0]["category"]

        for back_year in [2018, 2019]:
            diff = back_year - y1
            demand = max(50, int(round(d1 + slope * diff * 0.8)))
            records.append({
                "skill":       skill,
                "category":    cat,
                "year":        back_year,
                "demandCount": _add_noise(demand),
            })

    df = pd.DataFrame(records)
    df = df.drop_duplicates(subset=["skill", "year"])
    df = df.sort_values(["skill", "year"]).reset_index(drop=True)

    return df
