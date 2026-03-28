const Job = require("../models/job");
const Skill = require("../models/Skills");
const {
  forecastJobDemand,
  forecastSkillDemand,
  getFeatureImportance,
  getAvailableEntities,
  getModelInfo,
  isMlServiceUp,
} = require("../utils/mlService");

// @desc    Get multi-year job demand forecast (ML model)
// @route   GET /api/ml/forecast/jobs?role=X&industry=IT&years=5
// @access  Public
const mlForecastJobs = async (req, res) => {
  try {
    const { role, industry = "IT", years = 5 } = req.query;

    if (!role) {
      return res.status(400).json({ message: "Query param 'role' is required." });
    }

    // Load historical records for fallback
    const jobs = await Job.find({ role }).sort({ year: 1 });

    const result = await forecastJobDemand(role, industry, Number(years), jobs);

    res.json({
      role,
      industry,
      ...result,
    });
  } catch (error) {
    console.error("mlForecastJobs error:", error);
    res.status(500).json({ message: "Failed to generate job forecast." });
  }
};

// @desc    Get multi-year skill demand forecast (ML model)
// @route   GET /api/ml/forecast/skills?skill=X&years=5
// @access  Public
const mlForecastSkills = async (req, res) => {
  try {
    const { skill, years = 5 } = req.query;

    if (!skill) {
      return res.status(400).json({ message: "Query param 'skill' is required." });
    }

    // Load historical records for fallback
    const skills = await Skill.find({ skill }).sort({ year: 1 });

    const result = await forecastSkillDemand(skill, Number(years), skills);

    res.json({
      skill,
      ...result,
    });
  } catch (error) {
    console.error("mlForecastSkills error:", error);
    res.status(500).json({ message: "Failed to generate skill forecast." });
  }
};

// @desc    Get feature importance data
// @route   GET /api/ml/feature-importance
// @access  Public
const mlFeatureImportance = async (req, res) => {
  try {
    const data = await getFeatureImportance();
    if (!data) {
      return res.status(503).json({ message: "ML service unavailable." });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feature importance." });
  }
};

// @desc    Get all available roles, skills, industries from ML model
// @route   GET /api/ml/available
// @access  Public
const mlAvailable = async (req, res) => {
  try {
    const data = await getAvailableEntities();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available entities." });
  }
};

// @desc    Get ML model metadata (R², algorithm, sample count)
// @route   GET /api/ml/model-info
// @access  Public
const mlModelInfo = async (req, res) => {
  try {
    const info = await getModelInfo();
    const up = await isMlServiceUp();
    res.json({
      serviceOnline: up,
      ...(info || { trained: false }),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch model info." });
  }
};

module.exports = {
  mlForecastJobs,
  mlForecastSkills,
  mlFeatureImportance,
  mlAvailable,
  mlModelInfo,
};
