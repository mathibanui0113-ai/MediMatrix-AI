import { useState } from "react";
import Hero from "./components/Hero";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import PatientProfile from "./Pages/PatientProfile";
import HealthRecords from "./Pages/HealthRecords";

function App() {
  const [page, setPage] = useState("home");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("medimatrixUser")
      );
    } catch {
      return null;
    }
  });

  function navigateTo(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function handleLoginSuccess(loggedInUser) {
    if (!loggedInUser) return;

    sessionStorage.setItem(
      "medimatrixUser",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
    navigateTo("dashboard");
  }

  function handleLogout() {
    sessionStorage.removeItem("medimatrixUser");
    setUser(null);
    navigateTo("home");
  }

  if (page === "dashboard" && user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onOpenProfile={() => navigateTo("profile")}
        onOpenHealthRecords={() => navigateTo("healthrecords")}
      />
    );
  }

  if (page === "profile" && user) {
    return <PatientProfile user={user} />;
  }

  if (page === "healthrecords" && user) {
  return <HealthRecords user={user} />;
}

  if (page === "login") {
    return (
      <Login
        onBackHome={() => navigateTo("home")}
        onSignUp={() => navigateTo("signup")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (page === "signup") {
    return (
      <Signup onBackLogin={() => navigateTo("login")} />
    );
  }

  return (
    <div>
      <Hero onGetStarted={() => navigateTo("login")} />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          flexWrap: "wrap",
          padding: "25px 20px 40px",
          background: "#080c14",
        }}
      >
        <button
          type="button"
          onClick={() => navigateTo("login")}
          style={{
            padding: "15px 36px",
            border: "none",
            borderRadius: "10px",
            background:
              "linear-gradient(110deg, #a5f3fc, #67e8f9, #a5b4fc)",
            color: "#08111b",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Login to MediMatrix AI →
        </button>
      </div>
    </div>
  );
}

export default App;