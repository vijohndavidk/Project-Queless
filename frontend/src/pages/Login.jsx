import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("Please enter both username and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(form.username, form.password);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password.");
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
          <h2>Log in</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
          <p className="text-muted" style={{ marginTop: 16, fontSize: "0.9rem" }}>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
