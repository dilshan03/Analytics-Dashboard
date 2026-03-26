import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function RoleTimelineChart({ data }) {
  const chartData = data.map((item) => ({
    year: item.year,
    skillCount: item.skills.length,
  }));

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Role Evolution Timeline</h2>
        <p className="text-sm text-gray-500">
          Number of required skills across years
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="year" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="skillCount" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RoleTimelineChart;