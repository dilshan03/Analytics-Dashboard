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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Skill Prediction Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-semibold mb-4">Predicted Skill Demand Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-3">Skill</th>
                <th className="py-3">Category</th>
                <th className="py-3">Current Year</th>
                <th className="py-3">Current Demand</th>
                <th className="py-3">Predicted Year</th>
                <th className="py-3">Predicted Demand</th>
                <th className="py-3">Growth %</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{item.skill}</td>
                  <td className="py-3">{item.category}</td>
                  <td className="py-3">{item.currentYear}</td>
                  <td className="py-3">{item.currentDemand}</td>
                  <td className="py-3">{item.predictedYear}</td>
                  <td className="py-3">{item.predictedDemand}</td>
                  <td className="py-3">{item.growthRate}%</td>
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