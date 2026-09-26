import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import api from "../../services/api";

export default function BookAppointment() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ service: "", appointment_date: "", appointment_time: "" });
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
        if (active.length) setForm((f) => ({ ...f, service: String(active[0].id) }));
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.service || !form.appointment_date || !form.appointment_time) {
      setError("Please fill in service, date, and time.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("appointments/", form);
      navigate("/appointments");
    } catch (err) {
      const data = err.response?.data;
      const firstMsg = data && Object.values(data)[0];
      setError((Array.isArray(firstMsg) ? firstMsg[0] : firstMsg) || "Could not book this appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <DashboardLayout>
      <h1>Book an Appointment</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Service</label>
            <select className="form-select" name="service" value={form.service} onChange={handleChange}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.service_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              name="appointment_date"
              min={today}
              value={form.appointment_date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input
              className="form-input"
              type="time"
              name="appointment_time"
              value={form.appointment_time}
              onChange={handleChange}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
