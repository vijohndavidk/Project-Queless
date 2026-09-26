import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    phone: user?.profile?.phone || "",
    address: user?.profile?.address || "",
  });
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put("profile/", form);
      setUser(res.data);
      setSaved(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <h1>My Profile</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        {saved && <div className="alert alert-success">Profile updated.</div>}
        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" value={user.username} disabled />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={user.email} disabled />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" name="address" value={form.address} onChange={handleChange} />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
