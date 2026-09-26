import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import ServicePicker from "./ServicePicker";
import StatusBadge from "../../components/StatusBadge";
import api from "../../services/api";

export default function StaffQueue() {
  const [serviceId, setServiceId] = useState("");
  const [queueData, setQueueData] = useState(null);
  const [actioning, setActioning] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!serviceId) return;
    api.get(`staff/queue/?service=${serviceId}`).then((res) => setQueueData(res.data));
  }

  useEffect(load, [serviceId]);

  async function runAction(url, body) {
    setActioning(true);
    setError("");
    try {
      await api.post(url, body);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Action failed.");
    } finally {
      setActioning(false);
    }
  }

  const serving = queueData?.serving?.[0];

  return (
    <DashboardLayout>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h1 className="mb-0">Live Queue Console</h1>
        <ServicePicker value={serviceId} onChange={setServiceId} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Currently Serving</h3>
        {serving ? (
          <div className="flex-between">
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{serving.display_code}</div>
              <div className="text-muted">{serving.username}</div>
            </div>
            <div className="flex gap-8">
              <button className="btn btn-outline btn-sm" disabled={actioning} onClick={() => runAction("staff/recall-token/", { token: serving.id })}>
                Recall
              </button>
              <button className="btn btn-danger btn-sm" disabled={actioning} onClick={() => runAction("staff/skip-token/", { token: serving.id })}>
                Skip
              </button>
              <button className="btn btn-primary btn-sm" disabled={actioning} onClick={() => runAction("staff/complete-token/", { token: serving.id })}>
                Mark Completed
              </button>
            </div>
          </div>
        ) : (
          <p className="text-muted mb-0">No one is currently being served.</p>
        )}
      </div>

      <button className="btn btn-primary" disabled={actioning || !serviceId} onClick={() => runAction("staff/next-token/", { service: serviceId })}>
        Call Next Customer
      </button>

      <h3 style={{ marginTop: 28 }}>Waiting Queue ({queueData?.waiting_count ?? 0})</h3>
      {!queueData || queueData.waiting.length === 0 ? (
        <p className="text-muted">No one is waiting.</p>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Token</th><th>Customer</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {queueData.waiting.map((t) => (
                <tr key={t.id}>
                  <td>{t.display_code}</td>
                  <td>{t.username}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{new Date(t.joined_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
