import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import RoleComparisonCard from "../components/RoleComparisonCard";
import LoadingSpinner from "../components/LoadingSpinner";
import FilterSelect from "../components/FilterSelect";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import KpiCard from "../components/KpiCard";
import RoleTimelineChart from "../components/RoleTimelineChart";

function RoleEvolution() {
  const [roleRecords, setRoleRecords] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Data Analyst");
  const [fromYear, setFromYear] = useState("2022");
  const [toYear, setToYear] = useState("2026");
  const [comparison, setComparison] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComparison = async (role, from, to) => {
    try {
      setLoading(true);
      setError("");

      const [comparisonRes, timelineRes] = await Promise.all([
        API.get(`/api/roles/compare/${encodeURIComponent(role)}?from=${from}&to=${to}`),
        API.get(`/api/roles/evolution/${encodeURIComponent(role)}`),
      ]);

      setComparison(comparisonRes.data);
      setTimeline(timelineRes.data);
    } catch (error) {
      console.error("Role comparison fetch error:", error);
      setComparison(null);
      setTimeline([]);
      setError("Unable to load role evolution data for the selected options.");
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
        setError("Unable to load available roles.");
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

  const invalidYearRange = Number(fromYear) >= Number(toYear);

  useEffect(() => {
    if (selectedRole && fromYear && toYear && !invalidYearRange) {
      fetchComparison(selectedRole, fromYear, toYear);
    } else if (invalidYearRange) {
      setComparison(null);
      setTimeline([]);
    }
  }, [selectedRole, fromYear, toYear, invalidYearRange]);

  if (loading && !comparison && !timeline.length) return <LoadingSpinner />;
  if (error && !comparison && !timeline.length) return <ErrorState message={error} />;

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

        {invalidYearRange && (
          <p className="mt-4 text-sm font-medium text-red-600">
            The “To Year” must be greater than the “From Year”.
          </p>
        )}
      </div>

      {!invalidYearRange && comparison ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <KpiCard
              label="Skills in Start Year"
              value={comparison.fromSkills.length}
              hint={`Year ${comparison.fromYear}`}
            />
            <KpiCard
              label="Skills in End Year"
              value={comparison.toSkills.length}
              hint={`Year ${comparison.toYear}`}
            />
            <KpiCard
              label="Newly Added Skills"
              value={comparison.addedSkills.length}
              hint="Skills added over time"
            />
          </div>

          {timeline.length > 0 && <RoleTimelineChart data={timeline} />}

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
        </>
      ) : invalidYearRange ? (
        <EmptyState
          title="Invalid year selection"
          message="Choose a later end year to compare the role evolution."
        />
      ) : (
        <EmptyState
          title="No comparison data found"
          message="Try another role or choose a different year range."
        />
      )}
    </div>
  );
}

export default RoleEvolution;