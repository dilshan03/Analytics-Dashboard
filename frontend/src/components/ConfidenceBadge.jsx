/**
 * ConfidenceBadge.jsx
 * Displays a color-coded pill showing model confidence (R²-based).
 *
 * Props:
 *  confidence  {number}  0–100 percentage
 *  source      {string}  "ml" | "fallback"
 */

function ConfidenceBadge({ confidence, source }) {
  const pct = typeof confidence === "number" ? confidence : 0;

  const color =
    pct >= 80
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : pct >= 50
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";

  const icon = source === "ml" ? "🤖" : "📐";
  const label = source === "ml" ? "ML Model" : "WMA+LR";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${color}`}
      >
        {icon} {label} · {pct.toFixed(1)}% confidence
      </span>
    </div>
  );
}

export default ConfidenceBadge;
