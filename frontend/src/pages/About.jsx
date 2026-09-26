import Navbar from "../components/Navbar";

export default function About() {
  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 720 }}>
        <h1>About QueueLess</h1>
        <p className="text-muted">
          QueueLess is a smart digital queue and appointment management system built to
          replace paper tickets and guesswork with a simple, transparent queue that
          customers, staff, and administrators can all see in real time.
        </p>
        <p className="text-muted">
          Customers join a queue or book an appointment online, see their live position
          and estimated wait time, and get called automatically when it's their turn.
          Staff manage the queue from a live console, and administrators get a full
          overview of services, staff, and daily statistics.
        </p>
      </div>
    </div>
  );
}
