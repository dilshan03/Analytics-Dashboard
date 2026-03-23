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
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-200">
          Career Intelligence Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">
          Predict the future of jobs and skills with smart analytics
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-200">
          Explore job growth, skill demand, and the evolution of professional roles
          through a modern forecasting dashboard.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Roles"
          value={totalRoles}
          subtitle="Tracked role categories"
        />
        <SummaryCard
          title="Total Skills"
          value={totalSkills}
          subtitle="Skills included in analytics"
        />
        <SummaryCard
          title="Top Predicted Job"
          value={topJob ? topJob.role : "N/A"}
          subtitle={topJob ? `Forecast demand: ${topJob.predictedDemand}` : "No data"}
        />
        <SummaryCard
          title="Top Predicted Skill"
          value={topSkill ? topSkill.skill : "N/A"}
          subtitle={topSkill ? `Forecast demand: ${topSkill.predictedDemand}` : "No data"}
        />
      </section>
    </div>
  );
}

export default Home;