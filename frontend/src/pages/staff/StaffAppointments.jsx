import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import api from "../../services/api";

export default function StaffAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("appointments/").then((res) => setAppointments(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>All Appointments</h1>
      {appointments.length === 0 ? (
        <div className="card"><EmptyState title="No appointments booked yet" /></div>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.user}</td>
                  <td>{a.service_detail.service_name}</td>
                  <td>{a.appointment_date}</td>
                  <td>{a.appointment_time.slice(0, 5)}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
