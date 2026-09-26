import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import api from "../../services/api";

export default function QueueHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("staff/history/").then((res) => setHistory(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Queue History</h1>
      {history.length === 0 ? (
        <div className="card"><EmptyState title="No queue actions recorded yet" /></div>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Token</th><th>Action</th><th>Staff</th><th>Time</th></tr></thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{h.token_code}</td>
                  <td style={{ textTransform: "capitalize" }}>{h.action}</td>
                  <td>{h.staff_username || "—"}</td>
                  <td>{new Date(h.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
