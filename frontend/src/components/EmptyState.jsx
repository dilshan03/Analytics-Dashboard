function EmptyState({ title, message }) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  );
}

export default EmptyState;