/**
 * predictUtils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure JavaScript prediction utilities — no external libraries needed.
 *
 * Exports three functions:
 *  1. weightedMovingAverage(values)      → predicted next value
 *  2. linearRegression(years, values)    → { predictedValue, r2 }
 *  3. smartPredict(records)              → { predictedDemand, confidence, method }
 *
 * Used by jobController.js and skillController.js for forecasting demand.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Weighted Moving Average (WMA)
 * Assigns linearly increasing weights to values so that recent years
 * matter more than older years.
 *
 * Example with 5 values [v1, v2, v3, v4, v5]:
 *   weights = [1, 2, 3, 4, 5]
 *   predicted = (1·v1 + 2·v2 + 3·v3 + 4·v4 + 5·v5) / (1+2+3+4+5)
 *
 * @param {number[]} values - Historical demand values (oldest → newest)
 * @returns {number} Predicted next value
 */
function weightedMovingAverage(values) {
  if (values.length === 0) return 0;

  // Fall back to simple average if only 1 data point
  if (values.length === 1) return values[0];

  // Assign weight = position index + 1  (so latest gets highest weight)
  const totalWeight = values.reduce((sum, _, i) => sum + (i + 1), 0);
  const weightedSum = values.reduce((sum, v, i) => sum + v * (i + 1), 0);

  return Math.round(weightedSum / totalWeight);
}

/**
 * Least-Squares Linear Regression
 * Fits a straight line (y = slope·x + intercept) through all data points
 * using the classic least-squares formula — the same formula from your
 * Statistics class.
 *
 * Also returns R² (coefficient of determination):
 *   R² = 1  → perfect linear fit (very confident prediction)
 *   R² = 0  → no linear relationship at all (low confidence)
 *
 * @param {number[]} years  - X axis: array of year numbers e.g. [2020..2024]
 * @param {number[]} values - Y axis: demand count for each year
 * @returns {{ predictedValue: number, r2: number }}
 */
function linearRegression(years, values) {
  const n = years.length;

  if (n < 2) {
    return { predictedValue: values[0] || 0, r2: 0 };
  }

  // Calculate means
  const meanX = years.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  // Calculate slope (m) using least-squares formula
  // m = Σ[(x - x̄)(y - ȳ)] / Σ[(x - x̄)²]
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (years[i] - meanX) * (values[i] - meanY);
    denominator += (years[i] - meanX) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;

  // Calculate intercept (b) using: b = ȳ - m·x̄
  const intercept = meanY - slope * meanX;

  // Predict value for the next year (last year + 1)
  const nextYear = years[years.length - 1] + 1;
  const predictedValue = Math.round(slope * nextYear + intercept);

  // Calculate R² (goodness-of-fit score)
  // R² = 1 - (SS_residual / SS_total)
  const ssTot = values.reduce((sum, y) => sum + (y - meanY) ** 2, 0);
  const ssRes = values.reduce((sum, y, i) => {
    const fitted = slope * years[i] + intercept;
    return sum + (y - fitted) ** 2;
  }, 0);

  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { predictedValue, r2 };
}

/**
 * Smart Predict — Combines WMA + Linear Regression
 * Averages the two predictions for a balanced, robust forecast.
 * Returns a confidence % derived from R².
 *
 * @param {Array<{ year: number, demandCount: number }>} records
 *   Sorted ascending by year (oldest first)
 * @returns {{
 *   predictedDemand: number,   // final averaged prediction
 *   confidence: number,         // 0-100% based on R²
 *   method: string              // description of algorithm used
 * }}
 */
function smartPredict(records) {
  if (!records || records.length === 0) {
    return { predictedDemand: 0, confidence: 0, method: "no data" };
  }

  // Sort records by year to guarantee correct order
  const sorted = [...records].sort((a, b) => a.year - b.year);

  const years  = sorted.map((r) => r.year);
  const values = sorted.map((r) => r.demandCount);

  // --- Algorithm 1: Weighted Moving Average ---
  const wmaPrediction = weightedMovingAverage(values);

  // --- Algorithm 2: Linear Regression ---
  const { predictedValue: lrPrediction, r2 } = linearRegression(years, values);

  // --- Combine: simple average of both predictions ---
  const predictedDemand = Math.round((wmaPrediction + lrPrediction) / 2);

  // Confidence: scale R² from 0-1 to 0-100, round to 1 decimal
  const confidence = Math.round(r2 * 1000) / 10;  // e.g. 0.873 → 87.3

  return {
    predictedDemand,
    confidence,
    method: "Weighted Moving Average + Linear Regression",
  };
}

module.exports = { weightedMovingAverage, linearRegression, smartPredict };
