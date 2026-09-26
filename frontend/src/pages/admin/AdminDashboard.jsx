import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import api from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("admin/dashboard/").then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  const cards = [
    { label: "Total Customers", value: stats.total_users },
    { label: "Total Staff", value: stats.total_staff },
    { label: "Total Services", value: stats.total_services },
    { label: "Currently Waiting", value: stats.currently_waiting },
    { label: "Served Today", value: stats.customers_served_today },
    { label: "Avg Wait (min)", value: stats.average_waiting_time_minutes },
  ];

  return (
    <DashboardLayout>
      <h1>Admin Dashboard</h1>
      <div className="card-grid">
        {cards.map((c) => (
          <div className="card stat-card" key={c.label}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
