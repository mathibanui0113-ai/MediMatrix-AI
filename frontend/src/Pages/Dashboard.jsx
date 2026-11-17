import { useState } from "react";
import "./Dashboard.css";
import MedicineReminder from "./MedicineReminder";
import HealthRecords from "./HealthRecords";
import Appointments from "./Appointments";
const menuItems = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Medicine Reminders", icon: "✚" },
  { name: "Health Records", icon: "▤" },
  { name: "Appointments", icon: "▦" },
  { name: "AI Health Assistant", icon: "✧" },
  { name: "Pharmacy Locator", icon: "⌖" },
  { name: "Patient Profile", icon: "♙" },
];

const medicines = [
  {
    name: "Metformin 500mg",
    detail: "1 tablet · After food",
    time: "08:00 AM",
    status: "Demo",
  },
  {
    name: "Vitamin D3 60K",
    detail: "1 capsule · Once a week",
    time: "10:00 AM",
    status: "Upcoming",
  },
  {
    name: "Calcium 500mg",
    detail: "1 tablet · After food",
    time: "08:00 PM",
    status: "Upcoming",
  },
  {
    name: "Omega 3",
    detail: "1 capsule · After food",
    time: "09:00 PM",
    status: "Upcoming",
  },
];
function Dashboard({ user, onLogout, onOpenProfile, onOpenHealthRecords }) {
  const [active, setActive] = useState("Dashboard");
  const [question, setQuestion] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [period, setPeriod] = useState("7D");
// Pharmacy state variables inga add pannanum
  const [pharmacyLocation, setPharmacyLocation] = useState("");
  const [showPharmacyResults, setShowPharmacyResults] = useState(false);
  const displayName = user?.name || "Patient";

  function sendQuestion(event) {
  event.preventDefault();

  const userQuestion = question.trim().toLowerCase();
  if (!userQuestion) return;

  let reply = "";

  if (
    userQuestion.includes("blood pressure") ||
    userQuestion.includes("bp")
  ) {
    reply =
      "Blood pressure measures the force of blood against artery walls. Keep track of readings and discuss unusual readings with your healthcare professional.";
  } else if (
    userQuestion.includes("sleep") ||
    userQuestion.includes("tired")
  ) {
    reply =
      "For better sleep, try a regular bedtime, reduce screen time before bed, and keep your room comfortable. Persistent tiredness should be discussed with a healthcare professional.";
  } else if (
    userQuestion.includes("healthy") ||
    userQuestion.includes("habit") ||
    userQuestion.includes("diet")
  ) {
    reply =
      "Healthy habits include eating balanced meals, staying hydrated, getting regular physical activity, and sleeping consistently. Choose habits that suit your health needs.";
  } else if (
    userQuestion.includes("medicine") ||
    userQuestion.includes("tablet")
  ) {
    reply =
      "Follow the medicine schedule prescribed by your healthcare professional. Do not change your dose or stop a medicine without checking with them.";
  } else if (
    userQuestion.includes("doctor") ||
    userQuestion.includes("appointment")
  ) {
    reply =
      "Before your appointment, note your symptoms, when they started, your current medicines, allergies, and questions you want to ask your doctor.";
  } else if (
    userQuestion.includes("water") ||
    userQuestion.includes("hydration")
  ) {
    reply =
      "Hydration needs vary from person to person. If you have kidney or heart problems, follow your healthcare professional's fluid instructions rather than increasing water intake on your own.";
  } else {
    reply =
      "I can help with general information about healthy habits, sleep, medicines, and preparing for doctor visits. Try asking one of these topics. I cannot diagnose illnesses or replace professional medical advice.";
  }

  setChatReply(reply);
  setQuestion("");
}
  function openProfile() {
    if (typeof onOpenProfile === "function") {
      onOpenProfile();
    } else {
      setActive("Patient Profile");
    }
  }

  function renderContent() {
    if (active === "Appointments") {
      return (
        <section className="feature-page">
          <Appointments user={user} />
          <button
            type="button"
            className="primary-button"
            onClick={() => setActive("Dashboard")}
          >
            ← Back to dashboard
          </button>
        </section>
      );
    }
    if (active === "Medicine Reminders") {
  return (
    <section className="feature-page">
      <MedicineReminder user={user} />
      <button
        type="button"
        className="primary-button"
        onClick={() => setActive("Dashboard")}
      >
        ← Back to dashboard
      </button>
    </section>
  );
}
    if (active === "Health Records") {
  return (
    <section className="feature-page">
      <HealthRecords user={user} />
      <button
        type="button"
        className="primary-button"
        onClick={() => setActive("Dashboard")}
      >
        ← Back to dashboard
      </button>
    </section>
  );
}
if (active === "AI Health Assistant") {
  return (
    <section className="feature-page panel">
      <span className="eyebrow">
        MEDIMATRIX AI • HEALTH SUPPORT
      </span>

      <h1>AI Health Assistant</h1>
      <p>
        Ask general health questions and explore helpful wellness tips.
      </p>

      <div className="assistant-title">
        <div className="bot-avatar">✧</div>
        <div>
          <h2>Health Assistant</h2>
          <span className="online-status">
            ● Demo mode
          </span>
        </div>
      </div>

      <div className="chat-bubble">
        Hi {displayName}! ✨
        <br />
        How can I help you today?
      </div>

      <div className="suggested-questions">
        {[
          "How can I build healthy habits?",
          "Tips for better sleep",
          "What should I ask my doctor?",
          "How can I remember my medicines?",
        ].map((q) => (
          <button
            type="button"
            key={q}
            onClick={() => setQuestion(q)}
          >
            {q} ↗
          </button>
        ))}
      </div>

      {chatReply && (
        <div className="chat-reply">
          {chatReply}
        </div>
      )}

      <form className="chat-form" onSubmit={sendQuestion}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask a general health question..."
          aria-label="Ask the health assistant"
        />

        <button type="submit" aria-label="Send question">
          ➤
        </button>
      </form>

      <p className="disclaimer">
        Demo responses only. Not a diagnosis or a substitute
        for professional medical advice.
      </p>

      <button
        type="button"
        className="primary-button"
        onClick={() => setActive("Dashboard")}
      >
        ← Back to dashboard
      </button>
    </section>
  );
}
if (active === "Pharmacy Locator") {
  return (
    <section className="feature-page panel">
      <span className="eyebrow">
        MEDIMATRIX AI • PHARMACY SERVICES
      </span>

      <h1>Pharmacy Locator</h1>
      <p>
        Enter a city or area to find pharmacies on Google Maps.
      </p>

      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();

          const location = pharmacyLocation.trim();

          if (location) {
            window.open(
              `https://www.google.com/maps/search/pharmacies+in+${encodeURIComponent(location)}`,
              "_blank",
              "noopener,noreferrer"
            );
          }
        }}
      >
        <input
          type="text"
          value={pharmacyLocation}
          onChange={(event) => setPharmacyLocation(event.target.value)}
          placeholder="Enter city or area..."
          aria-label="Enter city or area"
          required
        />

        <button type="submit">Find Pharmacies ↗</button>
      </form>

      <div className="feature-placeholder">
        <span>⌖</span>
        <h2>Find nearby pharmacies</h2>
        <p>
          Search pharmacies, view available map listings,
          and check directions using Google Maps.
        </p>
        <span className="demo-badge">MAP SEARCH</span>
      </div>

      <p className="disclaimer">
        Medicine stock and availability must be confirmed directly
        with the pharmacy.
      </p>

      <button
        type="button"
        className="primary-button"
        onClick={() => setActive("Dashboard")}
      >
        ← Back to dashboard
      </button>
    </section>
  );
}
if (active === "Patient Profile") {
      return (
        <section className="feature-page panel">
          <span className="eyebrow">
            MEDIMATRIX AI • YOUR HEALTH SPACE
          </span>
          <h1>Patient Profile</h1>
          <p>Manage your personal and essential health information.</p>

          <div className="feature-placeholder">
            <span>♙</span>
            <h2>Your Health Profile</h2>
            <p>
              Manage your name, health ID, blood group, allergies,
              medical conditions and emergency contact.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={openProfile}
            >
              Open Full Profile →
            </button>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => setActive("Dashboard")}
          >
            ← Back to dashboard
          </button>
        </section>
      );
    }

    if (active === "Dashboard") {
      return (
        <>
          <section className="welcome-banner">
            <div className="welcome-copy">
              <span className="eyebrow">YOUR PERSONAL HEALTH SPACE</span>
              <h1>
                Good day, <span>{displayName}!</span>
              </h1>
              <p>
                Your health journey matters. Make today a healthy one.
              </p>
              <div className="wellness-tags">
                <span>💧 Stay hydrated</span>
                <span>💊 Take medicines as prescribed</span>
                <span>✦ Keep moving</span>
              </div>
            </div>

            <div className="heart-art" aria-hidden="true">
              <div className="heart-ring">♡</div>
              <svg viewBox="0 0 320 100" className="banner-ecg">
                <polyline points="0,55 65,55 82,55 100,20 120,82 145,5 170,68 190,55 320,55" />
              </svg>
              <div className="heart-caption">HEALTH • ENERGY • YOU</div>
            </div>
          </section>

          <div className="section-heading">
            <div>
              <span className="eyebrow">AT A GLANCE</span>
              <h2>Health overview</h2>
            </div>
            <span className="demo-badge">DEMO DATA</span>
          </div>

          <section className="metrics-grid">
            <article className="metric-card pink">
              <div className="metric-top">
                <span className="metric-icon">♡</span>
                <span className="live-dot" />
              </div>
              <p>Heart rate</p>
              <h3>72 <small>bpm</small></h3>
              <span className="metric-note">Illustrative value</span>
              <div className="mini-wave wave-pink" />
            </article>

            <article className="metric-card blue">
              <div className="metric-top">
                <span className="metric-icon">♢</span>
                <span className="live-dot" />
              </div>
              <p>Blood pressure</p>
              <h3>118/76 <small>mmHg</small></h3>
              <span className="metric-note">Illustrative value</span>
              <div className="mini-wave wave-blue" />
            </article>

            <article className="metric-card purple">
              <div className="metric-top">
                <span className="metric-icon">◉</span>
                <span className="live-dot" />
              </div>
              <p>Blood sugar</p>
              <h3>96 <small>mg/dL</small></h3>
              <span className="metric-note">Illustrative value</span>
              <div className="mini-wave wave-purple" />
            </article>

            <article className="metric-card aqua">
              <div className="metric-top">
                <span className="metric-icon">◇</span>
                <span className="live-dot" />
              </div>
              <p>Weight</p>
              <h3>— <small>kg</small></h3>
              <span className="metric-note">Add your measurement</span>
              <div className="mini-wave wave-aqua" />
            </article>
          </section>

          <section className="content-grid">
            <article className="panel medicine-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-symbol blue-text">✚</span>
                  <h2>Medicine reminders</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive("Medicine Reminders")}
                >
                  View all ↗
                </button>
              </div>

              <p className="panel-subtitle">
                Example schedule · confirm with your prescription
              </p>

              <div className="medicine-list">
                {medicines.map((medicine, index) => (
                  <div className="medicine-row" key={medicine.name}>
                    <button
                      type="button"
                      className={`medicine-check ${
                        completed.includes(index) ? "checked" : ""
                      }`}
                      onClick={() =>
                        setCompleted((old) =>
                          old.includes(index)
                            ? old.filter((i) => i !== index)
                            : [...old, index]
                        )
                      }
                      aria-label={`Mark ${medicine.name} as taken`}
                    >
                      {completed.includes(index) ? "✓" : "✚"}
                    </button>

                    <div className="medicine-info">
                      <strong>{medicine.name}</strong>
                      <span>{medicine.detail}</span>
                    </div>

                    <div className="medicine-time">
                      {medicine.time}
                      <span className="status-pill">
                        {completed.includes(index) ? "Done" : medicine.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-symbol purple-text">⌁</span>
                  <h2>Health trends</h2>
                </div>

                <div className="period-switch">
                  {["7D", "30D", "3M"].map((p) => (
                    <button
                      className={period === p ? "selected" : ""}
                      key={p}
                      onClick={() => setPeriod(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <p className="panel-subtitle">
                Illustrative chart · not connected to health devices
              </p>

              <div className="chart-legend">
                <span className="legend-pink">● Heart rate</span>
                <span className="legend-blue">● Blood pressure</span>
                <span className="legend-purple">● Blood sugar</span>
              </div>

              <div className="chart-area">
                <div className="chart-y-labels">
                  <span>180</span>
                  <span>120</span>
                  <span>60</span>
                  <span>0</span>
                </div>

                <svg
                  viewBox="0 0 440 190"
                  preserveAspectRatio="none"
                  className="trend-chart"
                  role="img"
                  aria-label={`Illustrative health trend chart for ${period}`}
                >
                  {[20, 65, 110, 155].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="440"
                      y2={y}
                      className="chart-grid-line"
                    />
                  ))}
                  <polyline
                    points="0,100 70,80 140,45 210,78 280,95 350,60 440,75"
                    className="chart-line line-pink"
                  />
                  <polyline
                    points="0,135 70,115 140,105 210,90 280,120 350,95 440,110"
                    className="chart-line line-blue"
                  />
                  <polyline
                    points="0,75 70,100 140,85 210,50 280,65 350,35 440,55"
                    className="chart-line line-purple"
                  />
                </svg>
              </div>

              <div className="chart-days">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </article>

            <article className="panel appointments-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-symbol aqua-text">▦</span>
                  <h2>Appointments</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive("Appointments")}
                >
                  View all ↗
                </button>
              </div>

              <div className="empty-state">
                <span className="empty-icon">▦</span>
                <strong>No appointments added</strong>
                <p>Your upcoming appointments will appear here.</p>
                <button
                  className="outline-button"
                  onClick={() => setActive("Appointments")}
                >
                  Manage appointments
                </button>
              </div>
            </article>

            <article className="panel records-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-symbol purple-text">▤</span>
                  <h2>Health records</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive("Health Records")}
                >
                  View all ↗
                </button>
              </div>

              <div className="empty-state">
                <span className="empty-icon">▤</span>
                <strong>Your records, organized</strong>
                <p>Prescriptions and reports can be added here.</p>
                <button
                  className="outline-button"
                  onClick={() => setActive("Health Records")}
                >
                  Open records
                </button>
              </div>
            </article>

            <article className="panel family-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-symbol pink-text">♧</span>
                  <h2>Family health</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive("Family Health")}
                >
                  View all ↗
                </button>
              </div>

              <div className="empty-state">
                <span className="empty-icon">♧</span>
                <strong>Care for your family</strong>
                <p>Add family profiles to organize their health records.</p>
                <button
                  className="outline-button"
                  onClick={() => setActive("Family Health")}
                >
                  Manage family
                </button>
              </div>
            </article>

            <article className="panel quick-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-symbol pink-text">ϟ</span>
                  <h2>Quick actions</h2>
                </div>
              </div>

              <button
                className="quick-action"
                onClick={() => setActive("Medicine Reminders")}
              >
                <span>✚</span>Add medicine
              </button>
              <button
                className="quick-action"
                onClick={() => setActive("Appointments")}
              >
                <span>▦</span>Book appointment
              </button>
              <button
                className="quick-action"
onClick={() => onOpenHealthRecords ? onOpenHealthRecords() : setActive("Health Records")}              >
                <span>⇧</span>Upload report
              </button>
              <button
                className="quick-action"
                onClick={() => setActive("Pharmacy Locator")}
              >
                <span>⌖</span>Find pharmacy
              </button>
              <button className="quick-action" onClick={openProfile}>
                <span>♙</span>Patient Profile
              </button>
            </article>

            <article className="panel assistant-panel">
              <div className="assistant-title">
                <div className="bot-avatar">✧</div>
                <div>
                  <h2>AI Health Assistant</h2>
                  <span className="online-status">● Ready to help</span>
                </div>
              </div>

              <div className="chat-bubble">
                Hi {displayName}! ✨
                <br />
                I'm your AI health assistant. How can I help you today?
              </div>

              <div className="suggested-questions">
                {[
                  "How can I build healthy habits?",
                  "What should I ask my doctor?",
                  "Tips for better sleep",
                ].map((q) => (
                  <button key={q} onClick={() => setQuestion(q)}>
                    {q} ↗
                  </button>
                ))}
              </div>

              {chatReply && <div className="chat-reply">{chatReply}</div>}

              <form className="chat-form" onSubmit={sendQuestion}>
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask a general health question..."
                  aria-label="Ask the health assistant"
                />
                <button type="submit" aria-label="Send question">
                  ➤
                </button>
              </form>

              <p className="disclaimer">
                AI responses are informational, not a medical diagnosis.
              </p>
            </article>
          </section>
        </>
      );
    }
    if (active === "Pharmacy Locator") {
  return (
    <section className="feature-page panel">
      <span className="eyebrow">
        MEDIMATRIX AI • PHARMACY SERVICES
      </span>

      <h1>Pharmacy Locator</h1>
      <p>
        Search by city or area to explore pharmacy options.
      </p>

      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (pharmacyLocation.trim()) {
            setShowPharmacyResults(true);
          }
        }}
      >
        <input
          value={pharmacyLocation}
          onChange={(event) => {
            setPharmacyLocation(event.target.value);
            setShowPharmacyResults(false);
          }}
          placeholder="Enter your city or area..."
          aria-label="Pharmacy search location"
          required
        />

        <button type="submit">Search</button>
      </form>

      {showPharmacyResults && (
        <div className="feature-placeholder">
          <span>⌖</span>
          <h2>Search location</h2>
          <p>{pharmacyLocation}</p>
          <p>
            Location search is working in demo mode.
            Connect a maps or pharmacy directory service
            to display verified nearby pharmacies.
          </p>
          <span className="demo-badge">DEMO MODE</span>
        </div>
      )}

      <p className="disclaimer">
        No real pharmacy listings or medicine-stock data
        are connected yet.
      </p>

      <button
        className="primary-button"
        onClick={() => setActive("Dashboard")}
      >
        ← Back to dashboard
      </button>
    </section>
  );
}

    const descriptions = {
      "Health Records":
        "Keep your health documents and reports organized in one place.",
      Appointments:
        "Keep track of upcoming doctor visits and appointment details.",
      "AI Health Assistant":
        "Ask general health questions and prepare for conversations with a healthcare professional.",
      "Family Health":
        "Organize health information for family members with their permission.",
      "Pharmacy Locator":
        "Find pharmacies by entering a location in a future connected version.",
    };

    return (
      <section className="feature-page panel">
        <span className="eyebrow">MEDIMATRIX AI • YOUR HEALTH SPACE</span>
        <h1>{active}</h1>
        <p>
          {descriptions[active] || "Manage your personal healthcare space."}
        </p>

        <div className="feature-placeholder">
          <span>✧</span>
          <h2>{active} workspace</h2>
          <p>
            This section's full functionality and secure data storage
            will be connected in the next development stage.
          </p>
          <span className="demo-badge">UI PREVIEW</span>
        </div>

        <button
          className="primary-button"
          onClick={() => setActive("Dashboard")}
        >
          ← Back to dashboard
        </button>
      </section>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">✚</div>
          <div>
            <strong>
              MediMatrix<span>AI</span>
            </strong>
            <small>INTELLIGENT HEALTHCARE</small>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                active === item.name ? "nav-item active" : "nav-item"
              }
              onClick={() =>
                item.name === "Patient Profile"
                  ? openProfile()
                  : setActive(item.name)
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {active === item.name && (
                <span className="nav-arrow">›</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-heart">♡</div>
          <strong>
            Better health.
            <br />
            Brighter tomorrow.
          </strong>
          <p>Your health journey, in one place.</p>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <strong>{displayName}</strong>
            <span>{user?.role || "Patient"} account</span>
          </div>
          <button
            className="logout-button"
            onClick={onLogout}
            title="Logout"
          >
            ↗
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            MediMatrix AI <span>/</span> {active}
          </div>

          <div className="topbar-right">
            <span className="secure-label">⌑ Secure health space</span>
            <button
              className="notification-button"
              onClick={() => setNotifications(!notifications)}
              aria-label="Notifications"
            >
              ♧<i />
            </button>
            <div className="topbar-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="topbar-name">
              {displayName}
              <small>{user?.role || "Patient"}</small>
            </div>
          </div>

          {notifications && (
            <div className="notification-popover">
              <strong>Notifications</strong>
              <p>No new notifications.</p>
            </div>
          )}
        </header>

        {renderContent()}

        <footer className="app-footer">
          <span>♧ Your health data deserves care and privacy.</span>
          <span>
            MediMatrix AI <b>•</b> Designed for healthier living
          </span>
        </footer>
      </main>
    </div>
  );
}
export default Dashboard;