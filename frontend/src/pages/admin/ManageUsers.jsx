import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import api from "../../services/api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("admin/users/").then((res) => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Manage Users</h1>
      <div className="card table-wrap">
        <table className="data-table">
          <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                <td>{new Date(u.date_joined).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
