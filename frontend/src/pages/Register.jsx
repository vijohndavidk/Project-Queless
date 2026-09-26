import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/useAuth";

const initialForm = {
  username: "",
  email: "",
  first_name: "",
  password: "",
  password2: "",
  phone: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!form.username || !form.email || !form.password || !form.password2) {
      return "Please fill in all required fields.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Please enter a valid email address.";
    }
    if (form.password !== form.password2) {
      return "Passwords do not match.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstField = Object.keys(data)[0];
        const firstMessage = Array.isArray(data[firstField]) ? data[firstField][0] : data[firstField];
        setError(firstMessage || "Registration failed. Please check your details.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="card auth-card">
          <h2>Create your account</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" name="first_name" value={form.first_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-input" name="username" value={form.username} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password *</label>
              <input className="form-input" type="password" name="password2" value={form.password2} onChange={handleChange} />
            </div>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <p className="text-muted" style={{ marginTop: 16, fontSize: "0.9rem" }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
