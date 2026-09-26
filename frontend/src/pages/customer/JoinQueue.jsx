import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import api from "../../services/api";

export default function JoinQueue() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("services/")
      .then((res) => {
        const active = res.data.filter((s) => s.status === "active");
        setServices(active);
        if (active.length) setSelected(String(active[0].id));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    if (!selected) {
      setError("Please choose a service.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("queue/join/", { service: selected });
      navigate("/queue-status");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not join the queue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Join a Queue</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label className="form-label">Service</label>
            <select className="form-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.service_name} (~{s.average_time} min/customer)
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Joining..." : "Get My Token"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
