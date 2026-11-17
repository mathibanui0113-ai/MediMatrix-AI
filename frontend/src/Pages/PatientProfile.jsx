import { useEffect, useState } from "react";
import "./PatientProfile.css";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = API_BASE_URL;
function PatientProfile({ user }) {
  const [profile, setProfile] = useState({
    fullName: user?.name || "",
    healthId: "",
    dateOfBirth: "",
    bloodGroup: "",
    phone: "",
    allergies: "",
    medicalConditions: "",
    emergencyContact: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    async function loadProfile() {
      try {
        const response = await fetch(
          `${API_URL}/api/profile/${user.id}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        const saved = data.profile;

        setProfile({
          fullName: saved.full_name || user?.name || "",
          healthId: saved.health_id || "",
          dateOfBirth: saved.date_of_birth || "",
          bloodGroup: saved.blood_group || "",
          phone: saved.phone_number || "",
          allergies: saved.allergies || "",
          medicalConditions: saved.medical_conditions || "",
          emergencyContact: saved.emergency_contact || "",
        });
      } catch (error) {
        setMessage(`Profile loading failed: ${error.message}`);
      }
    }

    loadProfile();
  }, [user?.id, user?.name]);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) {
      setMessage("Please log in again to save your profile.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: profile.fullName,
            date_of_birth: profile.dateOfBirth,
            blood_group: profile.bloodGroup,
            phone_number: profile.phone,
            emergency_contact: profile.emergencyContact,
            allergies: profile.allergies,
            medical_conditions: profile.medicalConditions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save profile.");
      }

      setProfile((previous) => ({
        ...previous,
        healthId:
          data.profile?.health_id || previous.healthId,
      }));

      setMessage("Profile saved successfully! Your details are stored.");
    } catch (error) {
      setMessage(
        `Save failed: ${error.message}. Check whether the backend is running.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="patient-profile-page">
      <section className="patient-profile-card">
        <p className="profile-eyebrow">MEDIMATRIX AI</p>
        <h1>Patient Health Profile</h1>
        <p className="profile-description">
          Manage your personal and essential health information.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="profile-grid">
            <label>
              Full Name
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Unique Health ID (UHID)
              <input
                name="healthId"
                value={profile.healthId}
                readOnly
                placeholder="Assigned by MediMatrix"
              />
            </label>

            <label>
              Date of Birth
              <input
                type="date"
                name="dateOfBirth"
                value={profile.dateOfBirth}
                onChange={handleChange}
              />
            </label>

            <label>
              Blood Group
              <select
                name="bloodGroup"
                value={profile.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              Emergency Contact
              <input
                type="tel"
                name="emergencyContact"
                value={profile.emergencyContact}
                onChange={handleChange}
              />
            </label>

            <label className="profile-full-width">
              Known Allergies
              <textarea
                name="allergies"
                value={profile.allergies}
                onChange={handleChange}
                placeholder="Enter known allergies, if any"
              />
            </label>

            <label className="profile-full-width">
              Existing Medical Conditions
              <textarea
                name="medicalConditions"
                value={profile.medicalConditions}
                onChange={handleChange}
                placeholder="Enter relevant medical conditions"
              />
            </label>
          </div>

          <button
            className="profile-save-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>

          {message && (
            <p className="profile-message" role="status">
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default PatientProfile;