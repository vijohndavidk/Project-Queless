import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import api from "../../services/api";

export default function QueueStatus() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  function load() {
    setLoading(true);
    api.get("queue/status/").then((res) => setTokens(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // Refresh every 15s so wait time / position stays current while the
    // customer has this tab open, without them needing to reload manually.
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleCancel(tokenId) {
    setCancellingId(tokenId);
    try {
      await api.post("queue/cancel/", { token: tokenId });
      load();
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Queue Status</h1>

      {tokens.length === 0 ? (
        <div className="card">
          <EmptyState title="You're not in any queue" hint="Join one to see your live position here." />
          <Link to="/join-queue"><button className="btn btn-primary">Join a Queue</button></Link>
        </div>
      ) : (
        tokens.map((t) => (
          <div className="card" key={t.token_id} style={{ marginBottom: 16 }}>
            <div className="flex-between">
              <div>
                <h3 className="mb-0">{t.token_number} · {t.service}</h3>
                <p className="text-muted mb-0">Joined at {new Date(t.joined_at).toLocaleTimeString()}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="card-grid" style={{ marginTop: 16 }}>
              <div>
                <div className="text-muted" style={{ fontSize: "0.85rem" }}>Now Serving</div>
                <div style={{ fontWeight: 700 }}>{t.current_serving_token || "—"}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: "0.85rem" }}>People Ahead</div>
                <div style={{ fontWeight: 700 }}>{t.people_ahead}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: "0.85rem" }}>Estimated Wait</div>
                <div style={{ fontWeight: 700 }}>{t.estimated_wait_minutes} min</div>
              </div>
            </div>
            <button
              className="btn btn-danger btn-sm"
              style={{ marginTop: 16 }}
              onClick={() => handleCancel(t.token_id)}
              disabled={cancellingId === t.token_id}
            >
              {cancellingId === t.token_id ? "Cancelling..." : "Cancel this token"}
            </button>
          </div>
        ))
      )}
    </DashboardLayout>
  );
}
