import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import SummaryCard from "../components/SummaryCard";
import KpiCard from "../components/KpiCard";
import SkillPredictionChart from "../components/SkillPredictionChart";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchInput from "../components/SearchInput";
import FilterSelect from "../components/FilterSelect";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

function SkillPrediction() {
  const [predictions, setPredictions] = useState([]);
  const [emergingSkills, setEmergingSkills] = useState([]);
  const [decliningSkills, setDecliningSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchSkill, setSearchSkill] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchSkillData = async () => {
      try {
        setError("");
        const [predictionsRes, emergingRes, decliningRes, skillsRes] = await Promise.all([
          API.get("/api/skills/predictions"),
          API.get("/api/skills/emerging"),
          API.get("/api/skills/declining"),
          API.get("/api/skills"),
        ]);

        setPredictions(predictionsRes.data);
        setEmergingSkills(emergingRes.data);
        setDecliningSkills(decliningRes.data);
        setSkills(skillsRes.data);
      } catch (error) {
        console.error("Skill data fetch error:", error);
        setError("Unable to load skill prediction data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();
  }, []);

  const categories = [...new Set(skills.map((skill) => skill.category))];

  const filteredPredictions = useMemo(() => {
    let filtered = [...predictions];

    if (searchSkill) {
      filtered = filtered.filter((item) =>
        item.skill.toLowerCase().includes(searchSkill.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (sortBy === "growth") {
      filtered.sort((a, b) => b.growthRate - a.growthRate);
    } else if (sortBy === "demand") {
      filtered.sort((a, b) => b.predictedDemand - a.predictedDemand);
    }

    return filtered;
  }, [predictions, searchSkill, selectedCategory, sortBy]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  const topEmerging = emergingSkills[0];
  const topDeclining = decliningSkills[0];
  const totalPredictedDemand = filteredPredictions.reduce(
    (sum, item) => sum + item.predictedDemand,
    0
  );
  const averageGrowth = filteredPredictions.length
    ? (
        filteredPredictions.reduce((sum, item) => sum + item.growthRate, 0) /
        filteredPredictions.length
      ).toFixed(2)
    : 0;
  const highestDemandSkill =
    filteredPredictions.length > 0
      ? [...filteredPredictions].sort((a, b) => b.predictedDemand - a.predictedDemand)[0]
      : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-purple-600">
          Skills Intelligence
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Skill Prediction Dashboard
        </h1>
        <p className="mt-2 text-gray-500">
          Discover future-ready skills, identify emerging technologies, and track
          declining competencies.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SummaryCard
          title="Top Emerging Skill"
          value={topEmerging ? topEmerging.skill : "N/A"}
          subtitle={topEmerging ? `${topEmerging.growthRate}% growth` : "No data"}
        />
        <SummaryCard
          title="Top Declining Skill"
          value={topDeclining ? topDeclining.skill : "N/A"}
          subtitle={topDeclining ? `${topDeclining.growthRate}% growth` : "No data"}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <KpiCard
          label="Filtered Results"
          value={filteredPredictions.length}
          hint="Skills after applying filters"
        />
        <KpiCard
          label="Total Predicted Demand"
          value={totalPredictedDemand}
          hint="Combined forecast demand"
        />
        <KpiCard
          label="Average Growth"
          value={`${averageGrowth}%`}
          hint={
            highestDemandSkill
              ? `Top demand skill: ${highestDemandSkill.skill}`
              : "No data available"
          }
        />
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">Filters & Search</h2>
          <p className="text-sm text-gray-500">
            Narrow results by skill name, category, or forecast priority.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          <SearchInput
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            placeholder="Search skill..."
          />
          <FilterSelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categories}
            placeholder="All Categories"
          />
          <FilterSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={["growth", "demand"]}
            placeholder="Sort By"
          />
        </div>
      </div>

      {filteredPredictions.length > 0 ? (
        <>
          <SkillPredictionChart data={filteredPredictions} />

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Predicted Skill Demand Table
                </h2>
                <p className="text-sm text-gray-500">
                  Forecasted skill demand based on recent year-over-year trends
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                {filteredPredictions.length} results
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="py-3 font-semibold">Skill</th>
                    <th className="py-3 font-semibold">Category</th>
                    <th className="py-3 font-semibold">Current Year</th>
                    <th className="py-3 font-semibold">Current Demand</th>
                    <th className="py-3 font-semibold">Predicted Year</th>
                    <th className="py-3 font-semibold">Predicted Demand</th>
                    <th className="py-3 font-semibold">Growth %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredictions.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 text-sm">
                      <td className="py-4 font-medium text-gray-900">{item.skill}</td>
                      <td className="py-4 text-gray-600">{item.category}</td>
                      <td className="py-4 text-gray-600">{item.currentYear}</td>
                      <td className="py-4 text-gray-600">{item.currentDemand}</td>
                      <td className="py-4 text-gray-600">{item.predictedYear}</td>
                      <td className="py-4 font-semibold text-gray-900">
                        {item.predictedDemand}
                      </td>
                      <td className="py-4">
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          {item.growthRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No matching skill predictions"
          message="Try changing your search text, category filter, or sort option."
        />
      )}
    </div>
  );
}

export default SkillPrediction;