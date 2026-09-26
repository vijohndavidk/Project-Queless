import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Loading from "../../components/Loading";
import api from "../../services/api";

/* Counters are represented as the counter_number on each Staff record.
   This page lets admins see and re-assign which counter each staff
   member is stationed at. */
export default function ManageCounters() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  function load() {
    api.get("admin/staff/").then((res) => setStaff(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateCounter(id, counter_number) {
    setSavingId(id);
    try {
      await api.patch(`admin/staff/${id}/`, { counter_number });
      load();
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Manage Counters</h1>
      <p className="text-muted">Assign each staff member to a physical counter number.</p>

      <div className="card table-wrap">
        <table className="data-table">
          <thead><tr><th>Staff</th><th>Department</th><th>Counter</th></tr></thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>{s.username}</td>
                <td>{s.department}</td>
                <td>
                  <input
                    className="form-input"
                    style={{ width: 90 }}
                    type="number"
                    defaultValue={s.counter_number}
                    disabled={savingId === s.id}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val && val !== s.counter_number) updateCounter(s.id, val);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
