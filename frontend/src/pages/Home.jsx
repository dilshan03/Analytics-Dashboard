import { useEffect, useState } from "react";
import API from "../services/api";
import SummaryCard from "../components/SummaryCard";
import LoadingSpinner from "../components/LoadingSpinner";

function Home() {
  const [jobPredictions, setJobPredictions] = useState([]);
  const [skillPredictions, setSkillPredictions] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, skillsRes, rolesRes] = await Promise.all([
          API.get("/api/jobs/predictions"),
          API.get("/api/skills/predictions"),
          API.get("/api/roles"),
        ]);

        setJobPredictions(jobsRes.data);
        setSkillPredictions(skillsRes.data);
        setRoleData(rolesRes.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const topJob = jobPredictions[0];
  const topSkill = skillPredictions[0];
  const totalRoles = new Set(roleData.map((item) => item.role)).size;
  const totalSkills = new Set(skillPredictions.map((item) => item.skill)).size;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <SummaryCard
          title="Total Roles"
          value={totalRoles}
          subtitle="Roles tracked in the system"
        />
        <SummaryCard
          title="Total Skills"
          value={totalSkills}
          subtitle="Skills analyzed from data"
        />
        <SummaryCard
          title="Top Predicted Job"
          value={topJob ? topJob.role : "N/A"}
          subtitle={topJob ? `Demand: ${topJob.predictedDemand}` : "No data"}
        />
        <SummaryCard
          title="Top Predicted Skill"
          value={topSkill ? topSkill.skill : "N/A"}
          subtitle={topSkill ? `Demand: ${topSkill.predictedDemand}` : "No data"}
        />
      </div>
    </div>
  );
}

export default Home;