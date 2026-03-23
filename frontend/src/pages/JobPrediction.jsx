import { useEffect, useState } from "react";
import API from "../services/api";
import SummaryCard from "../components/SummaryCard";
import JobPredictionChart from "../components/JobPredictionChart";
import LoadingSpinner from "../components/LoadingSpinner";

function JobPrediction() {
  const [predictions, setPredictions] = useState([]);
  const [topGrowing, setTopGrowing] = useState([]);
  const [topDeclining, setTopDeclining] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const [predictionsRes, growingRes, decliningRes] = await Promise.all([
          API.get("/api/jobs/predictions"),
          API.get("/api/jobs/top-growing"),
          API.get("/api/jobs/top-declining"),
        ]);

        setPredictions(predictionsRes.data);
        setTopGrowing(growingRes.data);
        setTopDeclining(decliningRes.data);
      } catch (error) {
        console.error("Job data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const bestJob = topGrowing[0];
  const weakJob = topDeclining[0];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Job Prediction Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SummaryCard
          title="Fastest Growing Role"
          value={bestJob ? bestJob.role : "N/A"}
          subtitle={bestJob ? `${bestJob.growthRate}% growth` : "No data"}
        />
        <SummaryCard
          title="Most Declining Role"
          value={weakJob ? weakJob.role : "N/A"}
          subtitle={weakJob ? `${weakJob.growthRate}% growth` : "No data"}
        />
      </div>

      <JobPredictionChart data={predictions} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-semibold mb-4">Predicted Job Demand Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-3">Role</th>
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
                  <td className="py-3">{item.role}</td>
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

export default JobPrediction;