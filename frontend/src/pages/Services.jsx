import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("services/")
      .then((res) => setServices(res.data))
      .catch(() => setError("Could not load services right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Our Services</h1>
        <p className="text-muted">Everything you can book an appointment or join a queue for.</p>

        {loading && <Loading label="Loading services..." />}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && services.length === 0 && (
          <EmptyState title="No services available yet" />
        )}

        <div className="card-grid">
          {services.map((s) => (
            <div className="card" key={s.id}>
              <h3>{s.service_name}</h3>
              <p className="text-muted">{s.description || "No description provided."}</p>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                Average time: {s.average_time} min
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
