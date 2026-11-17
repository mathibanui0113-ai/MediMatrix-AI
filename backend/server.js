const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const webpush = require("web-push");
const cron = require("node-cron");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;
const TIME_ZONE = "Asia/Kolkata";
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "uploads", "health-records");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed."));
    }
  },
});

const ALLOWED_ROLES = [
  "Patient",
  "Doctor",
  "Hospital Staff",
  "Family Member",
];

app.use(cors());
app.use(express.json());

// Configure Web Push only when keys exist
if (
  process.env.VAPID_SUBJECT &&
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.error("VAPID keys are missing in backend/.env");
}

app.get("/", (req, res) => {
  res.send("MediMatrix AI Backend is running!");
});

// PUBLIC VAPID KEY
app.get("/api/notifications/public-key", (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(500).json({
      message: "Notification configuration is missing.",
    });
  }

  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// SAVE PUSH SUBSCRIPTION
app.post("/api/notifications/subscribe", (req, res) => {
  try {
    const userId = Number(req.body.userId);
    const subscription = req.body.subscription;

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !subscription?.endpoint
    ) {
      return res.status(400).json({
        message: "Valid user ID and subscription are required.",
      });
    }

    const user = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Avoid storing the same endpoint multiple times
    const existing = db
      .prepare(
        "SELECT id FROM push_subscriptions WHERE user_id = ? AND subscription LIKE ?"
      )
      .get(userId, `%${subscription.endpoint}%`);

    if (!existing) {
      db.prepare(`
        INSERT INTO push_subscriptions (user_id, subscription)
        VALUES (?, ?)
      `).run(userId, JSON.stringify(subscription));
    }

    res.json({
      message: "Notification subscription saved successfully!",
    });
  } catch (error) {
    console.error("Subscription error:", error.message);
    res.status(500).json({
      message: "Could not save notification subscription.",
    });
  }
});

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const role = req.body.role || "Patient";

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Please select a valid role.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), normalizedEmail, hashedPassword, role);

    if (role === "Patient") {
      const healthId =
        `MM-${String(result.lastInsertRowid).padStart(6, "0")}`;

      db.prepare(`
        INSERT INTO patient_profiles (user_id, full_name, health_id)
        VALUES (?, ?, ?)
      `).run(result.lastInsertRowid, name.trim(), healthId);
    }

    res.status(201).json({
      message: "Account created successfully!",
      role,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      message: "Unable to create account. Please try again.",
    });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const user = db.prepare(`
      SELECT id, name, email, password, role
      FROM users
      WHERE email = ?
    `).get(email.trim().toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    res.json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "Patient",
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Unable to log in. Please try again.",
    });
  }
});

// GET PATIENT PROFILE
app.get("/api/profile/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const profile = db.prepare(`
      SELECT
        u.id AS user_id,
        u.name AS full_name,
        p.health_id,
        p.date_of_birth,
        p.blood_group,
        p.phone_number,
        p.emergency_contact,
        p.allergies,
        p.medical_conditions
      FROM users u
      LEFT JOIN patient_profiles p ON p.user_id = u.id
      WHERE u.id = ?
    `).get(userId);

    if (!profile) {
      return res.status(404).json({
        message: "User profile not found.",
      });
    }

    res.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({
      message: "Unable to load profile.",
    });
  }
});

// SAVE / UPDATE PATIENT PROFILE
app.put("/api/profile/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = db.prepare(
      "SELECT id, name FROM users WHERE id = ?"
    ).get(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const {
      full_name,
      date_of_birth,
      blood_group,
      phone_number,
      emergency_contact,
      allergies,
      medical_conditions,
    } = req.body;

    const clean = (value) =>
      typeof value === "string" ? value.trim() : "";

    const fullName = clean(full_name) || user.name;
    const dob = clean(date_of_birth);
    const bloodGroup = clean(blood_group);
    const phone = clean(phone_number);
    const emergency = clean(emergency_contact);
    const allergyText = clean(allergies);
    const conditions = clean(medical_conditions);

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    const existing = db.prepare(
      "SELECT health_id FROM patient_profiles WHERE user_id = ?"
    ).get(userId);

    const healthId =
      existing?.health_id ||
      `MM-${String(userId).padStart(6, "0")}`;

    db.prepare(`
      INSERT INTO patient_profiles (
        user_id, full_name, health_id, date_of_birth,
        blood_group, phone_number, emergency_contact,
        allergies, medical_conditions, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        full_name = excluded.full_name,
        date_of_birth = excluded.date_of_birth,
        blood_group = excluded.blood_group,
        phone_number = excluded.phone_number,
        emergency_contact = excluded.emergency_contact,
        allergies = excluded.allergies,
        medical_conditions = excluded.medical_conditions,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      userId,
      fullName,
      healthId,
      dob,
      bloodGroup,
      phone,
      emergency,
      allergyText,
      conditions
    );

    const profile = db.prepare(
      "SELECT * FROM patient_profiles WHERE user_id = ?"
    ).get(userId);

    res.json({
      message: "Patient profile saved successfully!",
      profile,
    });
  } catch (error) {
    console.error("Save profile error:", error.message);
    res.status(500).json({
      message: "Unable to save profile. Please try again.",
    });
  }
});
// GET HEALTH RECORDS
app.get("/api/health-records/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = db.prepare(
      "SELECT id FROM users WHERE id = ?"
    ).get(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const records = db.prepare(`
      SELECT id, title, category, record_date, notes,
             file_name, created_at
      FROM health_records
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId);

    res.json({ records });
  } catch (error) {
    console.error("Get health records error:", error.message);
    res.status(500).json({
      message: "Unable to load health records.",
    });
  }
});

// ADD HEALTH RECORD WITH FILE UPLOAD
app.post(
  "/api/health-records/:userId",
  upload.single("file"),
  (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const { title, category, record_date, notes } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Invalid user ID." });
      }

      const user = db.prepare(
        "SELECT id FROM users WHERE id = ?"
      ).get(userId);

      if (!user) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "User not found." });
      }

      if (
        typeof title !== "string" || !title.trim() ||
        typeof category !== "string" || !category.trim() ||
        !req.file
      ) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          message: "Title, category, and a file are required."
        });
      }

      const result = db.prepare(`
        INSERT INTO health_records
          (user_id, title, category, record_date, notes, file_name, file_path)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        title.trim(),
        category.trim(),
        typeof record_date === "string" ? record_date : "",
        typeof notes === "string" ? notes.trim() : "",
        req.file.originalname,
        req.file.filename
      );

      const record = db.prepare(`
        SELECT id, title, category, record_date, notes,
               file_name, file_path, created_at
        FROM health_records
        WHERE id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json({
        message: "Health record and file saved successfully!",
        record
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Add health record error:", error.message);
      res.status(500).json({
        message: "Unable to save health record."
      });
    }
  }
);

// DELETE HEALTH RECORD AND SAVED FILE
app.delete("/api/health-records/:userId/:recordId", (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const recordId = Number(req.params.recordId);

    if (
      !Number.isInteger(userId) || userId <= 0 ||
      !Number.isInteger(recordId) || recordId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid user or record ID.",
      });
    }

    const record = db.prepare(`
      SELECT file_path
      FROM health_records
      WHERE id = ? AND user_id = ?
    `).get(recordId, userId);

    if (!record) {
      return res.status(404).json({
        message: "Health record not found.",
      });
    }

    db.prepare(`
      DELETE FROM health_records
      WHERE id = ? AND user_id = ?
    `).run(recordId, userId);

    if (record.file_path) {
      const safeFilePath = path.join(
        uploadDir,
        path.basename(record.file_path)
      );

      if (fs.existsSync(safeFilePath)) {
        fs.unlinkSync(safeFilePath);
      }
    }

    res.json({
      message: "Health record and file deleted successfully!",
    });
  } catch (error) {
    console.error("Delete health record error:", error.message);
    res.status(500).json({
      message: "Unable to delete health record.",
    });
  }
});
// GET MEDICINES
app.get("/api/medicines/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = db.prepare(
      "SELECT id FROM users WHERE id = ?"
    ).get(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const medicines = db.prepare(`
      SELECT id, user_id, name, dosage, time, taken, created_at
      FROM medicines
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId);

    res.json({ medicines });
  } catch (error) {
    console.error("Get medicines error:", error.message);
    res.status(500).json({
      message: "Unable to load medicines.",
    });
  }
});

// ADD MEDICINE
app.post("/api/medicines/:userId", (req, res) => {app.get("/api/medicines/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = db.prepare(
      "SELECT id FROM users WHERE id = ?"
    ).get(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const medicines = db.prepare(`
      SELECT id, user_id, name, dosage, time, taken, created_at
      FROM medicines
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId);

    res.json({ medicines });
  } catch (error) {
    console.error("Get medicines error:", error.message);
    res.status(500).json({
      message: "Unable to load medicines.",
    });
  }
});

  try {
    const userId = Number(req.params.userId);
    const { name, dosage, time } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = db.prepare(
      "SELECT id FROM users WHERE id = ?"
    ).get(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (
      typeof name !== "string" ||
      typeof dosage !== "string" ||
      typeof time !== "string" ||
      !name.trim() ||
      !dosage.trim() ||
      !time.trim()
    ) {
      return res.status(400).json({
        message: "Medicine name, dosage, and time are required.",
      });
    }

    const result = db.prepare(`
      INSERT INTO medicines (user_id, name, dosage, time)
      VALUES (?, ?, ?, ?)
    `).run(userId, name.trim(), dosage.trim(), time.trim());

    const medicine = db.prepare(
      "SELECT id, user_id, name, dosage, time, taken, created_at FROM medicines WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json({
      message: "Medicine added successfully!",
      medicine,
    });
  } catch (error) {
    console.error("Add medicine error:", error.message);
    res.status(500).json({
      message: "Unable to add medicine.",
    });
  }
});

// MARK MEDICINE TAKEN / NOT TAKEN
app.patch("/api/medicines/:userId/:medicineId", (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const medicineId = Number(req.params.medicineId);
    const taken = req.body.taken;

    if (
      !Number.isInteger(userId) || userId <= 0 ||
      !Number.isInteger(medicineId) || medicineId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid user or medicine ID.",
      });
    }

    if (typeof taken !== "boolean") {
      return res.status(400).json({
        message: "Taken status must be true or false.",
      });
    }

    const result = db.prepare(`
      UPDATE medicines
      SET taken = ?
      WHERE id = ? AND user_id = ?
    `).run(taken ? 1 : 0, medicineId, userId);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Medicine not found for this user.",
      });
    }

    const medicine = db.prepare(`
      SELECT id, user_id, name, dosage, time, taken, created_at
      FROM medicines
      WHERE id = ? AND user_id = ?
    `).get(medicineId, userId);

    res.json({
      message: "Medicine status updated!",
      medicine,
    });
  } catch (error) {
    console.error("Update medicine error:", error.message);
    res.status(500).json({
      message: "Unable to update medicine status.",
    });
  }
});

// DELETE MEDICINE
app.delete("/api/medicines/:userId/:medicineId", (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const medicineId = Number(req.params.medicineId);

    if (
      !Number.isInteger(userId) || userId <= 0 ||
      !Number.isInteger(medicineId) || medicineId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid user or medicine ID.",
      });
    }

    const result = db.prepare(`
      DELETE FROM medicines
      WHERE id = ? AND user_id = ?
    `).run(medicineId, userId);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Medicine not found for this user.",
      });
    }

    res.json({ message: "Medicine deleted successfully!" });
  } catch (error) {
    console.error("Delete medicine error:", error.message);
    res.status(500).json({
      message: "Unable to delete medicine.",
    });
  }
});
/* =========================
   APPOINTMENTS API
========================= */

// GET APPOINTMENTS
app.get("/api/appointments/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const user = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const appointments = db.prepare(`
      SELECT id, user_id, doctor, specialty,
             appointment_date, appointment_time,
             notes, status, created_at
      FROM appointments
      WHERE user_id = ?
      ORDER BY appointment_date ASC, appointment_time ASC
    `).all(userId);

    res.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error.message);
    res.status(500).json({
      message: "Unable to load appointments.",
    });
  }
});


// BOOK APPOINTMENT
app.post("/api/appointments/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const {
      doctor,
      specialty,
      appointment_date,
      appointment_time,
      notes,
    } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const user = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (
      typeof doctor !== "string" || !doctor.trim() ||
      typeof specialty !== "string" || !specialty.trim() ||
      typeof appointment_date !== "string" || !appointment_date.trim() ||
      typeof appointment_time !== "string" || !appointment_time.trim()
    ) {
      return res.status(400).json({
        message: "Doctor, specialty, date, and time are required.",
      });
    }

    const result = db.prepare(`
      INSERT INTO appointments (
        user_id, doctor, specialty,
        appointment_date, appointment_time, notes
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      doctor.trim(),
      specialty.trim(),
      appointment_date.trim(),
      appointment_time.trim(),
      typeof notes === "string" ? notes.trim() : ""
    );

    const appointment = db.prepare(`
      SELECT id, user_id, doctor, specialty,
             appointment_date, appointment_time,
             notes, status, created_at
      FROM appointments
      WHERE id = ? AND user_id = ?
    `).get(result.lastInsertRowid, userId);

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error.message);
    res.status(500).json({
      message: "Unable to book appointment.",
    });
  }
});


// CANCEL APPOINTMENT
app.delete(
  "/api/appointments/:userId/:appointmentId",
  (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const appointmentId = Number(req.params.appointmentId);

      if (
        !Number.isInteger(userId) || userId <= 0 ||
        !Number.isInteger(appointmentId) || appointmentId <= 0
      ) {
        return res.status(400).json({
          message: "Invalid user or appointment ID.",
        });
      }

      const result = db.prepare(`
        DELETE FROM appointments
        WHERE id = ? AND user_id = ?
      `).run(appointmentId, userId);

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Appointment not found for this user.",
        });
      }

      res.json({
        message: "Appointment cancelled successfully!",
      });
    } catch (error) {
      console.error("Cancel appointment error:", error.message);
      res.status(500).json({
        message: "Unable to cancel appointment.",
      });
    }
  }
);
// Convert current time to India time
function getIndiaDateTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

// SEND DUE MEDICINE REMINDERS
async function sendDueMedicineReminders() {
  if (
    !process.env.VAPID_SUBJECT ||
    !process.env.VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY
  ) {
    return;
  }

  const { date, time } = getIndiaDateTime();

  const dueMedicines = db.prepare(`
    SELECT m.id, m.user_id, m.name, m.dosage, m.time
    FROM medicines m
    WHERE m.taken = 0
  `).all();

  for (const medicine of dueMedicines) {
    // Accept normal 24-hour time such as 08:30
    if (medicine.time.trim() !== time) continue;

    const subscriptions = db.prepare(`
      SELECT id, subscription
      FROM push_subscriptions
      WHERE user_id = ?
    `).all(medicine.user_id);

    if (subscriptions.length === 0) continue;

    // Log only after a successful push, so a failed attempt can retry
    const alreadySent = db.prepare(`
      SELECT id
      FROM medicine_notification_logs
      WHERE medicine_id = ? AND notification_date = ?
    `).get(medicine.id, date);

    if (alreadySent) continue;

    const payload = JSON.stringify({
      title: "MediMatrix AI — Medicine Reminder",
      body: `Time to take ${medicine.name} (${medicine.dosage}).`,
      url: "/",
    });

    let delivered = false;

    for (const item of subscriptions) {
      try {
        await webpush.sendNotification(
          JSON.parse(item.subscription),
          payload
        );
        delivered = true;
      } catch (error) {
        console.error("Push notification failed:", error.statusCode || error.message);

        // Remove expired/invalid subscriptions
        if (error.statusCode === 404 || error.statusCode === 410) {
          db.prepare(
            "DELETE FROM push_subscriptions WHERE id = ?"
          ).run(item.id);
        }
      }
    }

    if (delivered) {
      try {
        db.prepare(`
          INSERT OR IGNORE INTO medicine_notification_logs
            (medicine_id, user_id, notification_date)
          VALUES (?, ?, ?)
        `).run(medicine.id, medicine.user_id, date);

        console.log(`Reminder sent for medicine ${medicine.id} at ${time}`);
      } catch (error) {
        console.error("Notification log error:", error.message);
      }
    }
  }
}

// Run every minute using India time
cron.schedule("* * * * *", () => {
  sendDueMedicineReminders().catch((error) => {
    console.error("Reminder scheduler error:", error.message);
  });
}, {
  timezone: TIME_ZONE,
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});