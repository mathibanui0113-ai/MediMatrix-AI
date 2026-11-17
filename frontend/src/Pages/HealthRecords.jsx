import { useEffect, useState } from "react";
import "./HealthRecords.css";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/health-records`;
function HealthRecords({ user }) {
  const [records, setRecords] = useState([]);
  const [recordName, setRecordName] = useState("");
  const [category, setCategory] = useState("Prescription");
  const [recordDate, setRecordDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved health records
  useEffect(() => {
    if (!user?.id) return;

    const loadRecords = async () => {
      try {
        const response = await fetch(`${API_URL}/${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load records.");
        }

        setRecords(
          (data.records || []).map((record) => ({
            id: record.id,
            name: record.title,
            category: record.category,
            date: record.record_date,
            notes: record.notes,
            file: { name: record.file_name },
          }))
        );
      } catch (error) {
        console.error("Load records error:", error);
        alert("Unable to load health records.");
      }
    };

    loadRecords();
  }, [user?.id]);

  // Add health record
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recordName.trim() || !recordDate || !file) {
      alert("Please enter the record name, date, and select a file.");
      return;
    }

    if (!user?.id) {
      alert("Please log in again.");
      return;
    }

    const allowedExtensions = /\.(pdf|jpg|jpeg|png)$/i;

    if (!allowedExtensions.test(file.name)) {
      alert("Only PDF, JPG, JPEG, and PNG files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be 10 MB or less.");
      return;
    }

    const formData = new FormData();
    formData.append("title", recordName.trim());
    formData.append("category", category);
    formData.append("record_date", recordDate);
    formData.append("notes", notes.trim());
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/${user.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      const savedRecord = data.record;

      setRecords((previous) => [
        {
          id: savedRecord.id,
          name: savedRecord.title,
          category: savedRecord.category,
          date: savedRecord.record_date,
          notes: savedRecord.notes,
          file: { name: savedRecord.file_name },
        },
        ...previous,
      ]);

      setRecordName("");
      setCategory("Prescription");
      setRecordDate("");
      setNotes("");
      setFile(null);
      e.target.reset();

      alert("Health record saved successfully!");
    } catch (error) {
      console.error("Save record error:", error);
      alert(error.message || "Unable to upload the file.");
    } finally {
      setLoading(false);
    }
  };

  // Open saved file
  const viewRecord = (record) => {
    if (!user?.id || !record?.id) {
      alert("Unable to open this record.");
      return;
    }

    const fileUrl = `${API_URL}/${user.id}/${record.id}/file`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // Delete health record
  const deleteRecord = async (id) => {
    if (!user?.id) {
      alert("Please log in again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this health record?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${user.id}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete record.");
      }

      setRecords((previous) =>
        previous.filter((record) => record.id !== id)
      );

      alert("Health record deleted successfully!");
    } catch (error) {
      console.error("Delete record error:", error);
      alert(error.message || "Unable to delete record.");
    }
  };

  return (
    <div className="health-records">
      <h2>Health Records</h2>
      <p>Store and manage your medical documents.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Record Name</label>
          <input
            type="text"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            placeholder="Enter record name"
            required
          />
        </div>

        <div>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Prescription">Prescription</option>
            <option value="Lab Report">Lab Report</option>
            <option value="Medical Report">Medical Report</option>
            <option value="Scan">Scan</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Record Date</label>
          <input
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes (optional)"
          />
        </div>

        <div>
          <label>Upload File (PDF, JPG, JPEG, PNG)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Health Record"}
        </button>
      </form>

      <hr />

      <h3>Saved Records ({records.length})</h3>

      {records.length === 0 ? (
        <p>No health records found.</p>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <div className="record-card" key={record.id}>
              <h4>{record.name}</h4>
              <p>Category: {record.category}</p>
              <p>Date: {record.date || "Not specified"}</p>
              {record.notes && <p>Notes: {record.notes}</p>}
              <p>File: {record.file?.name || "No file name"}</p>

              <button
                type="button"
                onClick={() => viewRecord(record)}
              >
                View File
              </button>

              <button
                type="button"
                onClick={() => deleteRecord(record.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HealthRecords;