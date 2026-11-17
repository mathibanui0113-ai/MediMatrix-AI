import { useEffect, useState } from "react";
import "./Appointments.css";

const API_URL = "http://localhost:5000/api/appointments";

function Appointments({ user }) {
  const userId = user?.id;

  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAppointments() {
    if (!userId) {
      setMessage("Please log in to view your appointments.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load appointments.");
      }

      setAppointments(data.appointments || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [userId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!userId) {
      setMessage("Please log in first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor: doctor.trim(),
          specialty,
          appointment_date: date,
          appointment_time: time,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to book appointment.");
      }

      setDoctor("");
      setSpecialty("");
      setDate("");
      setTime("");
      setNotes("");
      setMessage("Appointment booked successfully!");

      await loadAppointments();
    } catch (error) {
      setMessage(error.message || "Unable to book appointment.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelAppointment(appointmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${userId}/${appointmentId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel appointment.");
      }

      setMessage("Appointment cancelled successfully!");
      await loadAppointments();
    } catch (error) {
      setMessage(error.message || "Unable to cancel appointment.");
    }
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h2>My Appointments</h2>
          <p>Schedule and manage your healthcare visits.</p>
        </div>
        <div className="appointment-count">
          {appointments.length} Appointments
        </div>
      </div>

      {message && (
        <div className="appointment-message" role="status">
          {message}
        </div>
      )}

      <div className="appointments-grid">
        <section className="appointment-card">
          <h3>Book an Appointment</h3>

          <form onSubmit={handleSubmit}>
            <label htmlFor="doctor">Doctor Name</label>
            <input
              id="doctor"
              type="text"
              placeholder="Enter doctor name"
              value={doctor}
              onChange={(event) => setDoctor(event.target.value)}
              required
            />

            <label htmlFor="specialty">Specialty</label>
            <select
              id="specialty"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              required
            >
              <option value="">Select specialty</option>
              <option value="General Physician">General Physician</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Dentist">Dentist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="appointment-date">Date</label>
            <input
              id="appointment-date"
              type="date"
              min={new Date().toLocaleDateString("en-CA")}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <label htmlFor="appointment-time">Time</label>
            <input
              id="appointment-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />

            <label htmlFor="appointment-notes">Notes (optional)</label>
            <textarea
              id="appointment-notes"
              placeholder="Reason for visit"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />

            <button type="submit" disabled={saving || !userId}>
              {saving ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </section>

        <section className="appointment-card">
          <h3>Upcoming Appointments</h3>

          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="appointments-empty">
              No appointments yet. Book your first appointment!
            </p>
          ) : (
            <div className="appointment-list">
              {appointments.map((appointment) => (
                <article
                  className="appointment-item"
                  key={appointment.id}
                >
                  <div>
                    <h4>{appointment.doctor}</h4>
                    <p>{appointment.specialty}</p>
                    <p>
                      {appointment.appointment_date} at{" "}
                      {appointment.appointment_time}
                    </p>

                    {appointment.notes && <p>{appointment.notes}</p>}
                  </div>

                  <button
                    type="button"
                    className="appointment-cancel"
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    Cancel
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Appointments;