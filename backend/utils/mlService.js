/**
 * mlService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Proxy utility for the Python FastAPI ML microservice.
 *
 * All functions:
 *  • Try the Python ML service first (http://localhost:8000)
 *  • Fall back gracefully to the JS smartPredict if ML service is offline
 *
 * Used by mlController.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

const axios = require("axios");
const { smartPredict } = require("./predictUtils");

const ML_BASE = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const TIMEOUT = 8000; // 8-second timeout

/**
 * Check if the ML service is reachable.
 */
async function isMlServiceUp() {
  try {
    const res = await axios.get(`${ML_BASE}/health`, { timeout: TIMEOUT });
    return res.data?.status === "ok" && res.data?.model_trained === true;
  } catch {
    return false;
  }
}

/**
 * Get a multi-year job demand forecast from the ML service.
 * Falls back to smartPredict (WMA + LR) if ML service is unavailable.
 *
 * @param {string} role - e.g. "Data Scientist"
 * @param {string} industry - e.g. "IT" (default)
 * @param {number} years - forecast horizon (default 5)
 * @param {Array} historicalRecords - used for fallback only
 */
async function forecastJobDemand(role, industry = "IT", years = 5, historicalRecords = []) {
  try {
    const res = await axios.get(`${ML_BASE}/forecast/jobs`, {
      params: { role, industry, years },
      timeout: TIMEOUT,
    });

    return {
      source: "ml",
      model: "RandomForest",
      r2: res.data.r2,
      predictions: res.data.predictions,
    };
  } catch (err) {
    // ── Fallback: use WMA + LR for the next year only ───────────────────────
    console.warn(`[mlService] ML service unavailable (${err.message}). Using fallback.`);

    if (historicalRecords.length === 0) {
      return {
        source: "fallback",
        model: "WMA + Linear Regression",
        r2: null,
        predictions: [],
      };
    }

    const { predictedDemand, confidence } = smartPredict(historicalRecords);
    const lastYear = Math.max(...historicalRecords.map((r) => r.year));

    return {
      source: "fallback",
      model: "WMA + Linear Regression",
      r2: confidence / 100,
      predictions: [
        {
          year: lastYear + 1,
          predictedDemand,
          confidence,
        },
      ],
    };
  }
}

/**
 * Get a multi-year skill demand forecast from the ML service.
 *
 * @param {string} skill - e.g. "Python"
 * @param {number} years - forecast horizon (default 5)
 * @param {Array} historicalRecords - used for fallback only
 */
async function forecastSkillDemand(skill, years = 5, historicalRecords = []) {
  try {
    const res = await axios.get(`${ML_BASE}/forecast/skills`, {
      params: { skill, years },
      timeout: TIMEOUT,
    });

    return {
      source: "ml",
      model: "RandomForest",
      r2: res.data.r2,
      predictions: res.data.predictions,
    };
  } catch (err) {
    console.warn(`[mlService] ML service unavailable (${err.message}). Using fallback.`);

    if (historicalRecords.length === 0) {
      return { source: "fallback", model: "WMA + Linear Regression", r2: null, predictions: [] };
    }

    const { predictedDemand, confidence } = smartPredict(historicalRecords);
    const lastYear = Math.max(...historicalRecords.map((r) => r.year));

    return {
      source: "fallback",
      model: "WMA + Linear Regression",
      r2: confidence / 100,
      predictions: [{ year: lastYear + 1, predictedDemand, confidence }],
    };
  }
}

/**
 * Get feature importance data from the ML service.
 */
async function getFeatureImportance() {
  try {
    const res = await axios.get(`${ML_BASE}/feature-importance`, { timeout: TIMEOUT });
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Get available roles, skills, and industries from the ML service.
 */
async function getAvailableEntities() {
  try {
    const res = await axios.get(`${ML_BASE}/available`, { timeout: TIMEOUT });
    return res.data;
  } catch {
    return { roles: [], skills: [], industries: [] };
  }
}

/**
 * Get model metadata (R², samples, algorithm).
 */
async function getModelInfo() {
  try {
    const res = await axios.get(`${ML_BASE}/model-info`, { timeout: TIMEOUT });
    return res.data;
  } catch {
    return null;
  }
}

module.exports = {
  isMlServiceUp,
  forecastJobDemand,
  forecastSkillDemand,
  getFeatureImportance,
  getAvailableEntities,
  getModelInfo,
};
