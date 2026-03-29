function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-8 py-5 backdrop-blur">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Future Job Trend Analysis Platform
          </h2>
          <p className="text-sm text-gray-500">
            Modern analytics dashboard for jobs, skills, and role evolution
          </p>
        </div>

        <div className="mt-3 md:mt-0">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Live Dashboard
          </span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;