import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import RoleComparisonCard from "../components/RoleComparisonCard";
import LoadingSpinner from "../components/LoadingSpinner";
import FilterSelect from "../components/FilterSelect";

function RoleEvolution() {
  const [roleRecords, setRoleRecords] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Data Analyst");
  const [fromYear, setFromYear] = useState("2022");
  const [toYear, setToYear] = useState("2026");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async (role, from, to) => {
    try {
      setLoading(true);
      const response = await API.get(
        `/api/roles/compare/${encodeURIComponent(role)}?from=${from}&to=${to}`
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
        setRoleRecords(response.data);
        const uniqueRoles = [...new Set(response.data.map((item) => item.role))];
        setRoles(uniqueRoles);
      } catch (error) {
        console.error("Role fetch error:", error);
      }
    };

    fetchRoles();
  }, []);

  const availableYears = useMemo(() => {
    const years = roleRecords
      .filter((item) => item.role === selectedRole)
      .map((item) => String(item.year));

    return [...new Set(years)].sort();
  }, [roleRecords, selectedRole]);

  useEffect(() => {
    if (selectedRole && fromYear && toYear) {
      fetchComparison(selectedRole, fromYear, toYear);
    }
  }, [selectedRole, fromYear, toYear]);

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FilterSelect
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={roles}
            placeholder="Select Role"
          />

          <FilterSelect
            value={fromYear}
            onChange={(e) => setFromYear(e.target.value)}
            options={availableYears}
            placeholder="From Year"
          />

          <FilterSelect
            value={toYear}
            onChange={(e) => setToYear(e.target.value)}
            options={availableYears}
            placeholder="To Year"
          />
        </div>
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
          <p className="text-gray-500">No comparison data found for the selected years.</p>
        </div>
      )}
    </div>
  );
}

export default RoleEvolution;