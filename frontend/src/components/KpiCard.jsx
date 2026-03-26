function KpiCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
      {hint && <p className="mt-2 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default KpiCard;