import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import api from "../../services/api";

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("admin/statistics/").then((res) => setRows(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Reports</h1>
      <p className="text-muted">Today's queue activity, broken down by service.</p>

      {rows.length === 0 ? (
        <div className="card"><EmptyState title="No queue activity yet today" /></div>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Service</th><th>Total Tokens</th><th>Completed</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.service__service_name}>
                  <td>{r.service__service_name}</td>
                  <td>{r.total_tokens}</td>
                  <td>{r.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
