function RoleComparisonCard({ title, skills, color }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-bold text-gray-900">{title}</h3>

      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <span
              key={index}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${color}`}
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-400">No skills found</p>
        )}
      </div>
    </div>
  );
}

export default RoleComparisonCard;