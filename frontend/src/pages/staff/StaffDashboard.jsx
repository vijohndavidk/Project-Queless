import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import ServicePicker from "./ServicePicker";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

export default function StaffDashboard() {
  const { user } = useAuth();
  const [serviceId, setServiceId] = useState("");
  const [queueData, setQueueData] = useState(null);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!serviceId) return;
    api.get(`staff/queue/?service=${serviceId}`).then((res) => setQueueData(res.data));
  }

  useEffect(load, [serviceId]);

  async function handleCallNext() {
    setCalling(true);
    setError("");
    try {
      await api.post("staff/next-token/", { service: serviceId });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not call the next token.");
    } finally {
      setCalling(false);
    }
  }

  const serving = queueData?.serving?.[0];

  return (
    <DashboardLayout>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h1 className="mb-0">Staff Dashboard</h1>
        <ServicePicker value={serviceId} onChange={setServiceId} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card-grid" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-label">Counter</div>
          <div className="stat-value">{user.staff_profile?.counter_number ?? "—"}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Now Serving</div>
          <div className="stat-value">{serving ? serving.display_code : "—"}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Waiting</div>
          <div className="stat-value">{queueData?.waiting_count ?? 0}</div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleCallNext} disabled={calling || !serviceId}>
        {calling ? "Calling..." : "Call Next"}
      </button>

      <h3 style={{ marginTop: 28 }}>Waiting Queue</h3>
      {!queueData || queueData.waiting.length === 0 ? (
        <p className="text-muted">No one is waiting for this service.</p>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Token</th><th>Customer</th><th>Joined</th></tr></thead>
            <tbody>
              {queueData.waiting.map((t) => (
                <tr key={t.id}>
                  <td>{t.display_code}</td>
                  <td>{t.username}</td>
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
