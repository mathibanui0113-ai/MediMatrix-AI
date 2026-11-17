import { useEffect, useState } from "react";
import "./MedicineReminder.css";
import { enableNotifications } from "../registerServiceWorker";

const API_URL = "http://localhost:5000/api/medicines";

function MedicineReminder({user:propUser}) {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    time: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const storedUser = sessionStorage.getItem("medimatrixUser");
let sessionUser = null;

try {
  sessionUser = storedUser ? JSON.parse(storedUser) : null;
} catch {
  sessionUser = null;
}

const user = propUser || sessionUser;
const userId = user?.id;

  // Load medicines
  useEffect(() => {
    if (!userId) {
      setError("Please log in again to manage your medicines.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadMedicines() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${userId}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load medicines.");
        }

        setMedicines(data.medicines || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMedicines();

    return () => controller.abort();
  }, [userId]);

  // Form input changes
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Enable push notifications
  async function handleEnableNotifications() {
    try {
      setNotificationLoading(true);
      setError("");
      setMessage("");

      if (!userId) {
        throw new Error("Please log in again.");
      }

      const result = await enableNotifications(userId);

      setMessage(
        result.message || "Notification subscription saved successfully!"
      );
    } catch (err) {
      setError(err.message || "Unable to enable notifications.");
    } finally {
      setNotificationLoading(false);
    }
  }

  // Add medicine
  async function handleSubmit(event) {
    event.preventDefault();

    if (!userId) {
      setError("Please log in again.");
      return;
    }

    if (!form.name.trim() || !form.dosage.trim() || !form.time) {
      setError("Please fill in all medicine details.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          dosage: form.dosage.trim(),
          time: form.time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add medicine.");
      }

      setMedicines((previous) => [data.medicine, ...previous]);

      setForm({
        name: "",
        dosage: "",
        time: "",
      });

      setMessage("Medicine added successfully!");
    } catch (err) {
      setError(err.message || "Unable to add medicine.");
    } finally {
      setSaving(false);
    }
  }

  // Mark taken or undo
  async function toggleTaken(medicine) {
    if (!userId) return;

    const newTakenStatus = !Boolean(medicine.taken);

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${userId}/${medicine.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taken: newTakenStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update medicine.");
      }

      setMedicines((previous) =>
        previous.map((item) =>
          item.id === medicine.id ? data.medicine : item
        )
      );

      setMessage(
        newTakenStatus
          ? "Medicine marked as taken!"
          : "Medicine status reset."
      );
    } catch (err) {
      setError(err.message || "Unable to update medicine.");
    }
  }

  // Delete medicine
  async function deleteMedicine(medicineId) {
    if (!userId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${userId}/${medicineId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete medicine.");
      }

      setMedicines((previous) =>
        previous.filter((medicine) => medicine.id !== medicineId)
      );

      setMessage("Medicine deleted successfully!");
    } catch (err) {
      setError(err.message || "Unable to delete medicine.");
    }
  }

  return (
    <main className="medicine-page">
      <section className="medicine-card">
        <p className="medicine-label">MEDIMATRIX AI</p>

        <h1>Medicine Reminder</h1>

        <p className="medicine-description">
          Organize your daily medication schedule.
        </p>

        <button
          type="button"
          onClick={handleEnableNotifications}
          disabled={notificationLoading || !userId}
        >
          {notificationLoading
            ? "Enabling..."
            : "🔔 Enable Medicine Notifications"}
        </button>

        {message && (
          <p className="medicine-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="medicine-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="medicine-form">
          <label>
            Medicine Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Vitamin tablet"
              maxLength={100}
              required
            />
          </label>

          <label>
            Dosage
            <input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="e.g. As prescribed"
              maxLength={100}
              required
            />
          </label>

          <label>
            Reminder Time
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" disabled={saving || !userId}>
            {saving ? "Adding..." : "+ Add Medicine"}
          </button>
        </form>

        <h2>My Medicines ({medicines.length})</h2>

        {loading ? (
          <p className="medicine-empty">Loading medicines...</p>
        ) : medicines.length === 0 ? (
          <p className="medicine-empty">
            No medicines added yet. Add your first medicine above.
          </p>
        ) : (
          <div className="medicine-list">
            {medicines.map((medicine) => (
              <article className="medicine-item" key={medicine.id}>
                <div>
                  <h3>{medicine.name}</h3>
                  <p>{medicine.dosage}</p>
                  <p>Reminder: {medicine.time}</p>

                  <span>
                    {Boolean(medicine.taken)
                      ? "Marked as taken"
                      : "Pending"}
                  </span>
                </div>

                <div className="medicine-actions">
                  <button
                    type="button"
                    onClick={() => toggleTaken(medicine)}
                  >
                    {Boolean(medicine.taken) ? "Undo" : "Mark Taken"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteMedicine(medicine.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MedicineReminder;