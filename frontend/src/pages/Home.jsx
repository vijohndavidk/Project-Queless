import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="card" style={{ padding: 48, textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "2.2rem" }}>Skip the line. Not the service.</h1>
          <p className="text-muted" style={{ fontSize: "1.05rem", maxWidth: 520, margin: "0 auto 24px" }}>
            QueueLess lets you join a digital queue or book an appointment from your
            phone, track your position in real time, and show up right when it's your turn.
          </p>
          <div className="flex" style={{ justifyContent: "center", gap: 12 }}>
            <Link to="/register"><button className="btn btn-primary">Get started</button></Link>
            <Link to="/services"><button className="btn btn-outline">Browse services</button></Link>
          </div>
        </div>

        <div className="card-grid">
          <div className="card">
            <h3>1. Choose a service</h3>
            <p className="text-muted">Pick from consultations, document services, payments, and more.</p>
          </div>
          <div className="card">
            <h3>2. Get a digital token</h3>
            <p className="text-muted">No paper ticket - your token and position live in your account.</p>
          </div>
          <div className="card">
            <h3>3. Walk in on time</h3>
            <p className="text-muted">See your estimated wait time update as the queue moves.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
