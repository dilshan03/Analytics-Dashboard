import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import SummaryCard from "../components/SummaryCard";
import JobPredictionChart from "../components/JobPredictionChart";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchInput from "../components/SearchInput";
import FilterSelect from "../components/FilterSelect";

function JobPrediction() {
  const [predictions, setPredictions] = useState([]);
  const [topGrowing, setTopGrowing] = useState([]);
  const [topDeclining, setTopDeclining] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchRole, setSearchRole] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const [predictionsRes, growingRes, decliningRes, jobsRes] = await Promise.all([
          API.get("/api/jobs/predictions"),
          API.get("/api/jobs/top-growing"),
          API.get("/api/jobs/top-declining"),
          API.get("/api/jobs"),
        ]);

        setPredictions(predictionsRes.data);
        setTopGrowing(growingRes.data);
        setTopDeclining(decliningRes.data);
        setJobs(jobsRes.data);
      } catch (error) {
        console.error("Job data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, []);

  const industries = [...new Set(jobs.map((job) => job.industry))];

  const filteredPredictions = useMemo(() => {
    let filtered = [...predictions];

    if (searchRole) {
      filtered = filtered.filter((item) =>
        item.role.toLowerCase().includes(searchRole.toLowerCase())
      );
    }

    if (selectedIndustry) {
      const allowedRoles = jobs
        .filter((job) => job.industry === selectedIndustry)
        .map((job) => job.role);

      filtered = filtered.filter((item) => allowedRoles.includes(item.role));
    }

    if (sortBy === "growth") {
      filtered.sort((a, b) => b.growthRate - a.growthRate);
    } else if (sortBy === "demand") {
      filtered.sort((a, b) => b.predictedDemand - a.predictedDemand);
    }

    return filtered;
  }, [predictions, searchRole, selectedIndustry, sortBy, jobs]);

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

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">Filters & Search</h2>
          <p className="text-sm text-gray-500">
            Refine the prediction results by role, industry, or ranking method.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          <SearchInput
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            placeholder="Search role..."
          />

          <FilterSelect
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            options={industries}
            placeholder="All Industries"
          />

          <FilterSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={["growth", "demand"]}
            placeholder="Sort By"
          />
        </div>
      </div>

      <JobPredictionChart data={filteredPredictions} />

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Predicted Job Demand Table</h2>
            <p className="text-sm text-gray-500">
              Role-wise demand forecast based on current growth trends
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            {filteredPredictions.length} results
          </span>
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
              {filteredPredictions.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 text-sm">
                  <td className="py-4 font-medium text-gray-900">{item.role}</td>
                  <td className="py-4 text-gray-600">{item.currentYear}</td>
                  <td className="py-4 text-gray-600">{item.currentDemand}</td>
                  <td className="py-4 text-gray-600">{item.predictedYear}</td>
                  <td className="py-4 font-semibold text-gray-900">
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

          {filteredPredictions.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">
              No job predictions match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobPrediction;