/**
 * MLForecastChart.jsx
 * Multi-year area chart showing predicted demand with a shaded confidence band.
 *
 * Props:
 *  data        {Array}   [{year, predictedDemand, confidence}]
 *  historical  {Array}   [{year, demandCount}]  — historical actuals
 *  label       {string}  e.g. "Data Scientist" or "Python"
 *  color       {string}  hex color for the area
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const CURRENT_YEAR = 2024;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/20 bg-slate-900/90 p-4 text-sm text-white shadow-2xl backdrop-blur-md">
      <p className="mb-2 font-bold text-blue-300">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-semibold">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function MLForecastChart({ data = [], historical = [], label = "", color = "#6366f1" }) {
  // Merge historical + forecast into one series
  const histPoints = historical.map((h) => ({
    year: h.year,
    actual: h.demandCount,
    forecast: null,
    upper: null,
    lower: null,
  }));

  const forecastPoints = data.map((d) => {
    const band = Math.round(d.predictedDemand * (1 - d.confidence / 100) * 0.3);
    return {
      year: d.year,
      actual: null,
      forecast: d.predictedDemand,
      upper: d.predictedDemand + band,
      lower: Math.max(0, d.predictedDemand - band),
    };
  });

  // Stitch: last historical point connects to first forecast
  const combined = [...histPoints, ...forecastPoints];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={combined} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            {/* Actual gradient */}
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            {/* Forecast gradient */}
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
            {/* Confidence band gradient */}
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) =>
              value === "actual"
                ? "Historical"
                : value === "forecast"
                ? "ML Forecast"
                : value === "upper"
                ? "Upper Bound"
                : "Lower Bound"
            }
          />

          {/* Dividing line at current year */}
          <ReferenceLine
            x={CURRENT_YEAR}
            stroke="#94a3b8"
            strokeDasharray="6 3"
            label={{ value: "Now", position: "top", fontSize: 11, fill: "#94a3b8" }}
          />

          {/* Confidence band (upper) */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#bandGrad)"
            connectNulls
            dot={false}
          />

          {/* Confidence band (lower) */}
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="white"
            connectNulls
            dot={false}
          />

          {/* Historical actuals */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#94a3b8"
            strokeWidth={2}
            fill="url(#actualGrad)"
            dot={{ r: 4, fill: "#94a3b8", strokeWidth: 0 }}
            connectNulls
            name="actual"
          />

          {/* ML forecast */}
          <Area
            type="monotone"
            dataKey="forecast"
            stroke={color}
            strokeWidth={2.5}
            strokeDasharray="6 3"
            fill="url(#forecastGrad)"
            dot={{ r: 4, fill: color, strokeWidth: 0 }}
            connectNulls
            name="forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MLForecastChart;
