import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import StatusBadge from "../../components/StatusBadge";
import api from "../../services/api";

const emptyForm = { id: null, service_name: "", description: "", average_time: "", status: "active" };

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api.get("services/").then((res) => setServices(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(service) {
    setForm(service);
  }

  function resetForm() {
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.service_name || !form.average_time) {
      setError("Service name and average time are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (form.id) {
        await api.put(`services/${form.id}/`, form);
      } else {
        await api.post("services/", form);
      }
      resetForm();
      load();
    } catch (err) {
      setError("Could not save this service.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await api.delete(`services/${id}/`);
    load();
  }

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Manage Services</h1>

      <div className="card" style={{ marginBottom: 24, maxWidth: 480 }}>
        <h3>{form.id ? "Edit Service" : "Add a New Service"}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Service Name</label>
            <input className="form-input" name="service_name" value={form.service_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" rows={2} value={form.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Average Time (minutes)</label>
            <input className="form-input" type="number" name="average_time" value={form.average_time} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : form.id ? "Update Service" : "Create Service"}
            </button>
            {form.id && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Avg Time</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.service_name}</td>
                <td>{s.average_time} min</td>
                <td><StatusBadge status={s.status} /></td>
                <td className="flex gap-8">
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(s)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
