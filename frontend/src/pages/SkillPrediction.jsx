import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import MLForecastChart from "../components/MLForecastChart";
import ConfidenceBadge from "../components/ConfidenceBadge";
import LoadingSpinner from "../components/LoadingSpinner";

// Direct calls to the Python ML service (avoids Node proxy overhead)
const ML_DIRECT = "http://127.0.0.1:8000";

function StatBox({ label, value, sub, color = "text-indigo-600" }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function SkillPrediction() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [forecastYears, setForecastYears] = useState(5);

  const [skillForecast, setSkillForecast] = useState(null);
  const [historicalSkills, setHistoricalSkills] = useState([]);
  const [skillFeatureImportance, setSkillFeatureImportance] = useState([]);

  const [modelInfo, setModelInfo] = useState(null);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [error, setError] = useState("");

  // ── Load available entities + model info on mount ──────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [availRes, infoRes, featRes] = await Promise.all([
          fetch(`${ML_DIRECT}/available`).then((r) => r.json()),
          fetch(`${ML_DIRECT}/model-info`).then((r) => r.json()),
          fetch(`${ML_DIRECT}/feature-importance`).then((r) => r.json()),
        ]);

        setSkills(availRes.skills || []);
        setModelInfo({ ...infoRes, serviceOnline: true });

        if (availRes.skills?.length > 0) {
          setSelectedSkill(availRes.skills[0]);
        }

        if (featRes?.skills) setSkillFeatureImportance(featRes.skills);
      } catch (err) {
        setError("ML service may be offline. Make sure the Python service is running on port 8000.");
      } finally {
        setLoadingAvailable(false);
      }
    };
    init();
  }, []);

  // ── Fetch skill forecast ───────────────────────────────────────────────────
  const fetchSkillForecast = useCallback(async () => {
    if (!selectedSkill) return;
    setLoadingForecast(true);
    setError("");
    try {
      const params = new URLSearchParams({ skill: selectedSkill, years: forecastYears });
      const [forecastRes, histRes] = await Promise.all([
        fetch(`${ML_DIRECT}/forecast/skills?${params}`).then((r) => r.json()),
        API.get("/api/skills", { params: { skill: selectedSkill } }),
      ]);
      setSkillForecast(forecastRes);
      setHistoricalSkills(histRes.data);
    } catch (err) {
      setError("Failed to load skill forecast.");
    } finally {
      setLoadingForecast(false);
    }
  }, [selectedSkill, forecastYears]);

  useEffect(() => {
    if (selectedSkill) fetchSkillForecast();
  }, [selectedSkill, forecastYears, fetchSkillForecast]);

  if (loadingAvailable) return <LoadingSpinner />;

  const entityColor = "#06b6d4";
  const peakForecast = skillForecast?.predictions
    ? Math.max(...skillForecast.predictions.map((p) => p.predictedDemand))
    : null;
  const lastHistorical = historicalSkills.length > 0 ? historicalSkills[historicalSkills.length - 1].demandCount : null;
  const lastHistoricalYear = historicalSkills.length > 0 ? historicalSkills[historicalSkills.length - 1].year : 2024;
  const growthPct =
    peakForecast && lastHistorical
      ? (((peakForecast - lastHistorical) / lastHistorical) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-300">
              🤖 ML Forecast Engine
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Skill Prediction Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Random Forest Regressor trained on historical stack data.
              Forecasts up to 10 years of specific skill evolution and market demand.
            </p>
          </div>

          {modelInfo && (
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">Model Stats</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-center">
                <div>
                  <p className="text-xl font-bold text-white">
                    {((modelInfo.skill_r2 || 0) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-400">R² Score</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{modelInfo.skill_samples || 0}</p>
                  <p className="text-xs text-slate-400">Samples</p>
                </div>
              </div>
              <div
                className={`mt-1 rounded-full px-3 py-1 text-center text-xs font-semibold ${
                  modelInfo.serviceOnline
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {modelInfo.serviceOnline ? "🟢 ML Service Online" : "🟡 Fallback Mode"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Configure Forecast</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {skills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Forecast Horizon
            </label>
            <select
              value={forecastYears}
              onChange={(e) => setForecastYears(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {[1, 2, 3, 5, 8, 10].map((y) => (
                <option key={y} value={y}>{y} Year{y > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ {error}
        </div>
      )}

      {/* ── KPI Stats ─────────────────────────────────────────────────────── */}
      {skillForecast && !loadingForecast && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatBox
            label="Current Demand"
            value={lastHistorical?.toLocaleString() ?? "—"}
            sub={`At ${lastHistoricalYear}`}
            color="text-slate-700"
          />
          <StatBox
            label="Peak Forecast"
            value={peakForecast?.toLocaleString() ?? "—"}
            sub={`By ${skillForecast.predictions?.at(-1)?.year}`}
            color="text-indigo-600"
          />
          <StatBox
            label="Projected Growth"
            value={growthPct !== null ? `${growthPct}%` : "—"}
            sub={`vs ${lastHistoricalYear}`}
            color={Number(growthPct) > 0 ? "text-emerald-600" : "text-red-500"}
          />
          <StatBox
            label="Model Confidence"
            value={skillForecast.predictions?.[0]?.confidence?.toFixed(1) + "%" ?? "—"}
            sub={skillForecast.source === "ml" ? "Random Forest R²" : "Fallback Model"}
            color="text-purple-600"
          />
        </div>
      )}

      {/* ── Forecast Chart & Table ────────────────────────────────────────── */}
      {loadingForecast ? (
        <LoadingSpinner />
      ) : (
        skillForecast && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedSkill} Demand Forecast
                </h2>
                <p className="text-sm text-slate-500">
                  Historical actuals + {forecastYears}-year ML projection
                </p>
              </div>
              <ConfidenceBadge
                confidence={skillForecast.predictions?.[0]?.confidence}
                source={skillForecast.source}
              />
            </div>

            <MLForecastChart
              data={skillForecast.predictions || []}
              historical={historicalSkills}
              label={selectedSkill}
              color={entityColor}
            />

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3">Year</th>
                    <th className="py-3">Predicted Demand</th>
                    <th className="py-3">Confidence</th>
                    <th className="py-3">vs {lastHistoricalYear}</th>
                  </tr>
                </thead>
                <tbody>
                  {(skillForecast.predictions || []).map((row, idx) => {
                    const diff = lastHistorical
                      ? (((row.predictedDemand - lastHistorical) / lastHistorical) * 100).toFixed(1)
                      : null;
                    return (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-700">{row.year}</td>
                        <td className="py-3 font-bold text-indigo-700">
                          {row.predictedDemand.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              row.confidence >= 80
                                ? "bg-emerald-100 text-emerald-700"
                                : row.confidence >= 50
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.confidence?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3">
                          {diff !== null && (
                            <span
                              className={`text-xs font-semibold ${
                                Number(diff) >= 0 ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {Number(diff) >= 0 ? "▲" : "▼"} {Math.abs(diff)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ── AI Insight ─────────────────────────────────────────────── */}
      {skillForecast && (
        <div className="rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200">
              💡
            </div>
            <h2 className="text-lg font-bold text-purple-900">AI Forecasting Insight</h2>
          </div>
          <p className="pl-10 text-slate-700 leading-relaxed">
            Our predictive model expects the <strong>{selectedSkill}</strong> skill to experience {Number(growthPct) >= 0 ? "an increasing trajectory" : "a decrease in market prioritization"}, resulting in an overall shift of <strong>{Math.abs(growthPct || 0)}%</strong> over the upcoming {forecastYears} years. {Number(growthPct) > 15 ? "This highly positive trend indicates it is a core competency to invest in for future-proofing." : Number(growthPct) > 0 ? "This modest growth suggests it remains a reliable, foundational capability." : "This trend suggests the technological landscape is shifting towards newer or alternative frameworks."}
          </p>
        </div>
      )}
    </div>
  );
}

export default SkillPrediction;