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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Role Evolution Analysis</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full md:w-80 border border-gray-300 rounded-xl px-4 py-2 outline-none"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-gray-500">No comparison data found.</p>
        </div>
      )}
    </div>
  );
}

export default RoleEvolution;