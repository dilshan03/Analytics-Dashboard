import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const linkClass = (path) =>
    `group flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="w-72 min-h-screen bg-slate-950 px-5 py-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">Future Jobs AI</h1>
        <p className="mt-2 text-sm text-slate-400">
          Forecast roles, skills, and career trends
        </p>
      </div>

      <nav className="space-y-3">
        <Link to="/" className={linkClass("/")}>
          Dashboard Overview
        </Link>
        <Link to="/jobs" className={linkClass("/jobs")}>
          Job Prediction
        </Link>
        <Link to="/skills" className={linkClass("/skills")}>
          Skill Prediction
        </Link>
        <Link to="/roles" className={linkClass("/roles")}>
          Role Evolution
        </Link>
      </nav>

      <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm font-semibold text-white">Insight Panel</p>
        <p className="mt-2 text-sm text-slate-400">
          Track fast-growing careers and discover future-ready skills.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;