function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-100 blur-2xl opacity-60"></div>

      <div className="relative">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          {title}
        </p>
        <h3 className="mt-3 text-3xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className="mt-2 text-sm text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export default SummaryCard;