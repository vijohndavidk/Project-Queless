import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import api from "../../services/api";

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ user: "", department: "", counter_number: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    Promise.all([api.get("admin/staff/"), api.get("admin/users/")])
      .then(([staffRes, usersRes]) => {
        setStaff(staffRes.data);
        setCustomers(usersRes.data.filter((u) => u.role === "customer"));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.user || !form.department || !form.counter_number) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("admin/staff/", form);
      setForm({ user: "", department: "", counter_number: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create staff member.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Manage Staff</h1>

      <div className="card" style={{ marginBottom: 24, maxWidth: 480 }}>
        <h3>Promote a Customer to Staff</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Customer</label>
            <select className="form-select" name="user" value={form.user} onChange={handleChange}>
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.username} ({c.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input className="form-input" name="department" value={form.department} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Counter Number</label>
            <input className="form-input" type="number" name="counter_number" value={form.counter_number} onChange={handleChange} />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Add Staff Member"}
          </button>
        </form>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead><tr><th>Username</th><th>Department</th><th>Counter</th><th>Status</th></tr></thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>{s.username}</td>
                <td>{s.department}</td>
                <td>{s.counter_number}</td>
                <td style={{ textTransform: "capitalize" }}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
