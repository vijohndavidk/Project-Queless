import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-dot" />
        QueueLess
      </Link>
      <div className="navbar-links">
        <Link to="/services">Services</Link>
        <Link to="/about">About</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span className="text-muted">Hi, {user.first_name || user.username}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">
              <button className="btn btn-primary btn-sm">Sign up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
