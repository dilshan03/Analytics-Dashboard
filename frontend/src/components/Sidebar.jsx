import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">Future Jobs</h1>

      <nav className="flex flex-col gap-4">
        <Link to="/" className="hover:text-cyan-400">Dashboard</Link>
        <Link to="/jobs" className="hover:text-cyan-400">Job Prediction</Link>
        <Link to="/skills" className="hover:text-cyan-400">Skill Prediction</Link>
        <Link to="/roles" className="hover:text-cyan-400">Role Evolution</Link>
      </nav>
    </div>
  );
}

export default Sidebar;