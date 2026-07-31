function Features() {
  return (
    <div
      style={{
        padding: "60px 40px",
        color: "white",
        textAlign: "center",
      }}
    >
      <h2>Our Features</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            width: "220px",
          }}
        >
          <h3>💊 Medicine Reminder</h3>
          <p>Never miss your medicines with smart reminders.</p>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            width: "220px",
          }}
        >
          <h3>📋 Health Records</h3>
          <p>Store and access your medical records securely.</p>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            width: "220px",
          }}
        >
          <h3>🤖 AI Assistant</h3>
          <p>Get AI-powered health suggestions and guidance.</p>
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            width: "220px",
          }}
        >
          <h3>🏥 Pharmacy Locator</h3>
          <p>Find nearby pharmacies quickly and easily.</p>
        </div>
      </div>
    </div>
  );
}

export default Features;