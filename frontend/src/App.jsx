import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import JoinQueue from "./pages/customer/JoinQueue";
import QueueStatus from "./pages/customer/QueueStatus";
import BookAppointment from "./pages/customer/BookAppointment";
import Appointments from "./pages/customer/Appointments";
import Profile from "./pages/customer/Profile";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffQueue from "./pages/staff/StaffQueue";
import StaffAppointments from "./pages/staff/StaffAppointments";
import QueueHistory from "./pages/staff/QueueHistory";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageStaff from "./pages/admin/ManageStaff";
import ManageServices from "./pages/admin/ManageServices";
import ManageCounters from "./pages/admin/ManageCounters";
import Reports from "./pages/admin/Reports";

/* /dashboard is a single entry point that sends each role to their own
   home page - this is what Login/Register redirect to after success. */
function DashboardRedirect() {
  const { role } = useAuth();
  if (role === "staff") return <Navigate to="/staff/dashboard" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <CustomerDashboard />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Shared entry point */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

      {/* Customer */}
      <Route path="/join-queue" element={<ProtectedRoute allowedRoles={["customer"]}><JoinQueue /></ProtectedRoute>} />
      <Route path="/queue-status" element={<ProtectedRoute allowedRoles={["customer"]}><QueueStatus /></ProtectedRoute>} />
      <Route path="/book-appointment" element={<ProtectedRoute allowedRoles={["customer"]}><BookAppointment /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute allowedRoles={["customer"]}><Appointments /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["customer"]}><Profile /></ProtectedRoute>} />

      {/* Staff */}
      <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={["staff"]}><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/queue" element={<ProtectedRoute allowedRoles={["staff"]}><StaffQueue /></ProtectedRoute>} />
      <Route path="/staff/appointments" element={<ProtectedRoute allowedRoles={["staff"]}><StaffAppointments /></ProtectedRoute>} />
      <Route path="/staff/history" element={<ProtectedRoute allowedRoles={["staff"]}><QueueHistory /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={["admin"]}><ManageStaff /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute allowedRoles={["admin"]}><ManageServices /></ProtectedRoute>} />
      <Route path="/admin/counters" element={<ProtectedRoute allowedRoles={["admin"]}><ManageCounters /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
