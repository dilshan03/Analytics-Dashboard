import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import MLForecastChart from "../components/MLForecastChart";
import ConfidenceBadge from "../components/ConfidenceBadge";
import LoadingSpinner from "../components/LoadingSpinner";

// Direct calls to the Python ML service (avoids Node proxy overhead)
const ML_DIRECT = "http://127.0.0.1:8000";

const ROLE_COLORS = {
  "Data Scientist":    "#6366f1",
  "ML Engineer":       "#8b5cf6",
  "Software Developer":"#06b6d4",
  "DevOps Engineer":   "#10b981",
  "Cloud Architect":   "#f59e0b",
  "Data Analyst":      "#ef4444",
};

function StatBox({ label, value, sub, color = "text-indigo-600" }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function JobPrediction() {
  const [roles, setRoles] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("IT");
  const [forecastYears, setForecastYears] = useState(5);

  const [jobForecast, setJobForecast] = useState(null);
  const [historicalJobs, setHistoricalJobs] = useState([]);
  const [jobFeatureImportance, setJobFeatureImportance] = useState([]);

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

        setRoles(availRes.roles || []);
        setIndustries(availRes.industries || []);
        setModelInfo({ ...infoRes, serviceOnline: true });

        if (availRes.roles?.length > 0) {
          setSelectedRole(availRes.roles[0]);
        }

        if (featRes?.jobs) setJobFeatureImportance(featRes.jobs);
      } catch (err) {
        setError("ML service may be offline. Make sure the Python service is running on port 8000.");
      } finally {
        setLoadingAvailable(false);
      }
    };
    init();
  }, []);

  // ── Fetch job forecast ─────────────────────────────────────────────────────
  const fetchJobForecast = useCallback(async () => {
    if (!selectedRole) return;
    setLoadingForecast(true);
    setError("");
    try {
      const params = new URLSearchParams({ role: selectedRole, industry: selectedIndustry, years: forecastYears });
      const [forecastRes, histRes] = await Promise.all([
        fetch(`${ML_DIRECT}/forecast/jobs?${params}`).then((r) => r.json()),
        API.get("/api/jobs", { params: { role: selectedRole } }),
      ]);
      setJobForecast(forecastRes);
      setHistoricalJobs(histRes.data);
    } catch (err) {
      setError("Failed to load job forecast.");
    } finally {
      setLoadingForecast(false);
    }
  }, [selectedRole, selectedIndustry, forecastYears]);

  useEffect(() => {
    if (selectedRole) fetchJobForecast();
  }, [selectedRole, selectedIndustry, forecastYears, fetchJobForecast]);

  if (loadingAvailable) return <LoadingSpinner />;

  const entityColor = ROLE_COLORS[selectedRole] || "#6366f1";
  const peakForecast = jobForecast?.predictions
    ? Math.max(...jobForecast.predictions.map((p) => p.predictedDemand))
    : null;
  const lastHistorical = historicalJobs.length > 0 ? historicalJobs[historicalJobs.length - 1].demandCount : null;
  const lastHistoricalYear = historicalJobs.length > 0 ? historicalJobs[historicalJobs.length - 1].year : 2024;
  const growthPct =
    peakForecast && lastHistorical
      ? (((peakForecast - lastHistorical) / lastHistorical) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
              🤖 ML Forecast Engine
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Job Prediction Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Random Forest Regressor trained on augmented BLS + Stack Overflow data.
              Forecasts up to 10 years of role-specific demand matching current trends.
            </p>
          </div>

          {modelInfo && (
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Model Stats</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-center">
                <div>
                  <p className="text-xl font-bold text-white">
                    {((modelInfo.job_r2 || 0) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-400">R² Score</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{modelInfo.job_samples || 0}</p>
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
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {industries.map((i) => (
                <option key={i} value={i}>{i}</option>
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
      {jobForecast && !loadingForecast && (
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
            sub={`By ${jobForecast.predictions?.at(-1)?.year}`}
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
            value={jobForecast.predictions?.[0]?.confidence?.toFixed(1) + "%" ?? "—"}
            sub={jobForecast.source === "ml" ? "Random Forest R²" : "Fallback Model"}
            color="text-blue-600"
          />
        </div>
      )}

      {/* ── Forecast Chart & Table ────────────────────────────────────────── */}
      {loadingForecast ? (
        <LoadingSpinner />
      ) : (
        jobForecast && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedRole} — {selectedIndustry} Demand Forecast
                </h2>
                <p className="text-sm text-slate-500">
                  Historical actuals + {forecastYears}-year ML projection
                </p>
              </div>
              <ConfidenceBadge
                confidence={jobForecast.predictions?.[0]?.confidence}
                source={jobForecast.source}
              />
            </div>

            <MLForecastChart
              data={jobForecast.predictions || []}
              historical={historicalJobs}
              label={selectedRole}
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
                  {(jobForecast.predictions || []).map((row, idx) => {
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
      {jobForecast && (
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-200">
              ✨
            </div>
            <h2 className="text-lg font-bold text-indigo-900">AI Forecasting Insight</h2>
          </div>
          <p className="pl-10 text-slate-700 leading-relaxed">
            Based on Random Forest analysis of cross-industry historical data, the <strong>{selectedRole}</strong> role in the <strong>{selectedIndustry}</strong> sector is projecting {Number(growthPct) >= 0 ? "a strong upward trend" : "a market consolidation"} with a total estimated shift of <strong>{Math.abs(growthPct || 0)}%</strong> over the next {forecastYears} years. Model confidence is <strong>{jobForecast.predictions?.[0]?.confidence?.toFixed(1) || "N/A"}%</strong>. {Number(growthPct) > 10 ? "This indicates expanding opportunities and high demand for specialized talent." : "This suggests stable or shifting requirements as the tech ecosystem adapts."}
          </p>
        </div>
      )}
    </div>
  );
}

export default JobPrediction;