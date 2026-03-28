/**
 * FeatureImportanceChart.jsx
 * Horizontal bar chart showing Random Forest feature importance weights.
 *
 * Props:
 *  data   {Array}  [{feature, importance}]  — sorted descending
 *  title  {string}
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { feature, importance } = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/90 p-3 text-xs text-white shadow-xl backdrop-blur-sm">
      <p className="font-semibold capitalize text-purple-300">{feature}</p>
      <p className="mt-1">
        Importance: <span className="font-bold">{(importance * 100).toFixed(1)}%</span>
      </p>
    </div>
  );
};

function FeatureImportanceChart({ data = [], title = "Feature Importance" }) {
  const sorted = [...data].sort((a, b) => b.importance - a.importance);

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-medium text-slate-500">{title}</p>
      <ResponsiveContainer width="100%" height={Math.max(150, sorted.length * 48)}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis
            type="number"
            domain={[0, 1]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fontSize: 12, fill: "#475569" }}
            tickLine={false}
            axisLine={false}
            width={75}
            className="capitalize"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="importance" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FeatureImportanceChart;
