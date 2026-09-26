import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/useAuth";

/* Shared shell for every logged-in page: navbar on top, role-based
   sidebar on the left, page content on the right. */
export default function DashboardLayout({ children }) {
  const { role } = useAuth();
  return (
    <div>
      <Navbar />
      <div className="app-shell">
        <Sidebar role={role} />
        <main className="app-main">
          <div className="page-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
