import { useEffect, useState } from "react";
import API from "../services/api";
import RoleComparisonCard from "../components/RoleComparisonCard";
import LoadingSpinner from "../components/LoadingSpinner";

function RoleEvolution() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Data Analyst");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async (role) => {
    try {
      setLoading(true);
      const response = await API.get(
        `/api/roles/compare/${encodeURIComponent(role)}?from=2022&to=2026`
      );
      setComparison(response.data);
    } catch (error) {
      console.error("Role comparison fetch error:", error);
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await API.get("/api/roles");
        const uniqueRoles = [...new Set(response.data.map((item) => item.role))];
        setRoles(uniqueRoles);
      } catch (error) {
        console.error("Role fetch error:", error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    fetchComparison(selectedRole);
  }, [selectedRole]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-green-600">
          Role Transformation
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Role Evolution Analysis
        </h1>
        <p className="mt-2 text-gray-500">
          Compare how job roles evolve over time and identify newly required skills.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Select Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none md:w-80"
        >
          {roles.map((role, index) => (
            <option key={index} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : comparison ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <RoleComparisonCard
            title={`Skills in ${comparison.fromYear}`}
            skills={comparison.fromSkills}
            color="bg-blue-100 text-blue-700"
          />
          <RoleComparisonCard
            title={`Skills in ${comparison.toYear}`}
            skills={comparison.toSkills}
            color="bg-purple-100 text-purple-700"
          />
          <RoleComparisonCard
            title="Added Skills"
            skills={comparison.addedSkills}
            color="bg-green-100 text-green-700"
          />
          <RoleComparisonCard
            title="Removed Skills"
            skills={comparison.removedSkills}
            color="bg-red-100 text-red-700"
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-500">No comparison data found.</p>
        </div>
      )}
    </div>
  );
}

export default RoleEvolution;