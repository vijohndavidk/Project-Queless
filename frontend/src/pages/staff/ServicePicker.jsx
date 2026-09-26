import { useEffect, useState } from "react";
import api from "../../services/api";

/* Small shared control: staff pick which service's queue they're
   working. Staff aren't tied to one service in the data model, so we
   let them choose - this keeps the demo simple for a junior project. */
export default function ServicePicker({ value, onChange }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get("services/").then((res) => {
      const active = res.data.filter((s) => s.status === "active");
      setServices(active);
      if (!value && active.length) onChange(String(active[0].id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <select className="form-select" style={{ maxWidth: 260 }} value={value} onChange={(e) => onChange(e.target.value)}>
      {services.map((s) => (
        <option key={s.id} value={s.id}>{s.service_name}</option>
      ))}
    </select>
  );
}
