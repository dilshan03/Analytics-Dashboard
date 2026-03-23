function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );
}

export default SummaryCard;