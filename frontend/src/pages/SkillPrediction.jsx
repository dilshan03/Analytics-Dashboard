import { useEffect, useState } from "react";
import API from "../services/api";
import SummaryCard from "../components/SummaryCard";
import SkillPredictionChart from "../components/SkillPredictionChart";
import LoadingSpinner from "../components/LoadingSpinner";

function SkillPrediction() {
  const [predictions, setPredictions] = useState([]);
  const [emergingSkills, setEmergingSkills] = useState([]);
  const [decliningSkills, setDecliningSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillData = async () => {
      try {
        const [predictionsRes, emergingRes, decliningRes] = await Promise.all([
          API.get("/api/skills/predictions"),
          API.get("/api/skills/emerging"),
          API.get("/api/skills/declining"),
        ]);

        setPredictions(predictionsRes.data);
        setEmergingSkills(emergingRes.data);
        setDecliningSkills(decliningRes.data);
      } catch (error) {
        console.error("Skill data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const topEmerging = emergingSkills[0];
  const topDeclining = decliningSkills[0];

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

      <SkillPredictionChart data={predictions} />

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">Predicted Skill Demand Table</h2>
          <p className="text-sm text-gray-500">
            Forecasted skill demand based on recent year-over-year trends
          </p>
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
              {predictions.map((item, index) => (
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
    </div>
  );
}

export default SkillPrediction;