function RoleComparisonCard({ title, skills, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-gray-400">No skills found</p>
        )}
      </div>
    </div>
  );
}

export default RoleComparisonCard;