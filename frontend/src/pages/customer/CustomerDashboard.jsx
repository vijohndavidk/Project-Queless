import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("queue/status/"), api.get("appointments/")])
      .then(([queueRes, apptRes]) => {
        setTokens(queueRes.data);
        const today = new Date().toISOString().slice(0, 10);
        setAppointments(apptRes.data.filter((a) => a.appointment_date === today));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Welcome, {user.first_name || user.username}</h1>

      {tokens.length === 0 ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <p className="mb-0">You're not in any queue right now.</p>
        </div>
      ) : (
        tokens.map((t) => (
          <div className="token-hero" key={t.token_id} style={{ marginBottom: 24 }}>
            <div className="flex-between">
              <div>
                <div style={{ opacity: 0.85, fontSize: "0.9rem" }}>Your Token · {t.service}</div>
                <div className="token-number">{t.token_number}</div>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="flex gap-16" style={{ marginTop: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ opacity: 0.85, fontSize: "0.85rem" }}>Now Serving</div>
                <div style={{ fontWeight: 700 }}>{t.current_serving_token || "—"}</div>
              </div>
              <div>
                <div style={{ opacity: 0.85, fontSize: "0.85rem" }}>People Ahead</div>
                <div style={{ fontWeight: 700 }}>{t.people_ahead}</div>
              </div>
              <div>
                <div style={{ opacity: 0.85, fontSize: "0.85rem" }}>Estimated Wait</div>
                <div style={{ fontWeight: 700 }}>{t.estimated_wait_minutes} min</div>
              </div>
            </div>
          </div>
        ))
      )}

      <h3>Today's Appointments</h3>
      {appointments.length === 0 ? (
        <p className="text-muted">No appointments scheduled for today.</p>
      ) : (
        <div className="card-grid">
          {appointments.map((a) => (
            <div className="card" key={a.id}>
              <div className="flex-between">
                <strong>{a.service_detail.service_name}</strong>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-muted mb-0">{a.appointment_time.slice(0, 5)}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
