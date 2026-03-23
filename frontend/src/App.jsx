import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import JobPrediction from "./pages/JobPrediction";
import SkillPrediction from "./pages/SkillPrediction";
import RoleEvolution from "./pages/RoleEvolution";

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobPrediction />} />
          <Route path="/skills" element={<SkillPrediction />} />
          <Route path="/roles" element={<RoleEvolution />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;