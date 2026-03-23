import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const linkClass = (path) =>
    `rounded-xl px-4 py-3 transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="w-72 min-h-screen bg-slate-900 p-5">
      <h1 className="text-2xl font-bold text-white mb-8">Future Jobs</h1>

      <nav className="flex flex-col gap-3">
        <Link to="/" className={linkClass("/")}>
          Dashboard
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
    </div>
  );
}

export default Sidebar;