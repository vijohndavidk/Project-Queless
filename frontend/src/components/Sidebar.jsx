import { NavLink } from "react-router-dom";

const LINKS_BY_ROLE = {
  customer: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/join-queue", label: "Join Queue" },
    { to: "/queue-status", label: "Queue Status" },
    { to: "/appointments", label: "Appointments" },
    { to: "/profile", label: "Profile" },
  ],
  staff: [
    { to: "/staff/dashboard", label: "Dashboard" },
    { to: "/staff/queue", label: "Live Queue" },
    { to: "/staff/appointments", label: "Appointments" },
    { to: "/staff/history", label: "Queue History" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/staff", label: "Staff" },
    { to: "/admin/services", label: "Services" },
    { to: "/admin/counters", label: "Counters" },
    { to: "/admin/reports", label: "Reports" },
  ],
};

export default function Sidebar({ role }) {
  const links = LINKS_BY_ROLE[role] || [];
  return (
    <aside className="sidebar">
      <div className="sidebar-heading">{role === "admin" ? "Admin" : role === "staff" ? "Staff" : "My Account"}</div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
