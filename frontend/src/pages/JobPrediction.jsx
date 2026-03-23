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
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-blue-600">
          Forecast Module
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Job Prediction Dashboard
        </h1>
        <p className="mt-2 text-gray-500">
          Analyze future job demand, identify growth opportunities, and monitor
          declining roles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">Predicted Job Demand Table</h2>
          <p className="text-sm text-gray-500">
            Role-wise demand forecast based on current growth trends
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="py-3 font-semibold">Role</th>
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
                  <td className="py-4 font-medium text-gray-900">{item.role}</td>
                  <td className="py-4 text-gray-600">{item.currentYear}</td>
                  <td className="py-4 text-gray-600">{item.currentDemand}</td>
                  <td className="py-4 text-gray-600">{item.predictedYear}</td>
                  <td className="py-4 text-gray-900 font-semibold">
                    {item.predictedDemand}
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
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

export default JobPrediction;