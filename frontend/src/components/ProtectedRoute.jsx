import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

/*
 * Wraps a page and only renders it if:
 *   1. the user is logged in, and
 *   2. (optionally) their role is in `allowedRoles`.
 * Otherwise it redirects - to /login if not authenticated, or to their
 * own dashboard if they're logged in but with the wrong role.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
