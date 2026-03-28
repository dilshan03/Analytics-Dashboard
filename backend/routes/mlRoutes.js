const express = require("express");
const router = express.Router();

const {
  mlForecastJobs,
  mlForecastSkills,
  mlFeatureImportance,
  mlAvailable,
  mlModelInfo,
} = require("../controllers/mlController");

// GET /api/ml/forecast/jobs?role=X&industry=IT&years=5
router.get("/forecast/jobs", mlForecastJobs);

// GET /api/ml/forecast/skills?skill=X&years=5
router.get("/forecast/skills", mlForecastSkills);

// GET /api/ml/feature-importance
router.get("/feature-importance", mlFeatureImportance);

// GET /api/ml/available
router.get("/available", mlAvailable);

// GET /api/ml/model-info
router.get("/model-info", mlModelInfo);

module.exports = router;
