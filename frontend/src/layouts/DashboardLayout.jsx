import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;