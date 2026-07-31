function Hero() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "100px 20px",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "50px", marginBottom: "20px" }}>
        Smart Healthcare Starts Here
      </h1>

      <p style={{ fontSize: "20px", color: "#cbd5e1" }}>
        AI-powered Medicine Reminder, Health Records, Pharmacy Locator and
        Personal Health Assistant.
      </p>

      <button
        style={{
          marginTop: "30px",
          padding: "15px 35px",
          backgroundColor: "#3B82F6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "18px",
        }}
      >
        Get Started
      </button>
    </div>
  );
}

export default Hero;