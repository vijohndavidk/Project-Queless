import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import api from "../../services/api";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("appointments/").then((res) => setAppointments(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCancel(id) {
    await api.patch(`appointments/${id}/`, { status: "cancelled" });
    load();
  }

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex-between">
        <h1>My Appointments</h1>
        <Link to="/book-appointment"><button className="btn btn-primary">Book New</button></Link>
      </div>

      {appointments.length === 0 ? (
        <div className="card"><EmptyState title="No appointments yet" /></div>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th><th>Date</th><th>Time</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.service_detail.service_name}</td>
                  <td>{a.appointment_date}</td>
                  <td>{a.appointment_time.slice(0, 5)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status !== "cancelled" && a.status !== "completed" && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
