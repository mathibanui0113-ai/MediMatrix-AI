function Register() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: "40px",
          borderRadius: "10px",
          width: "350px",
        }}
      >
        <h2 style={{ color: "white", textAlign: "center" }}>Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          style={{ width: "100%", padding: "10px", marginTop: "20px" }}
        />

        <input
          type="email"
          placeholder="Email"
          style={{ width: "100%", padding: "10px", marginTop: "15px" }}
        />

        <input
          type="password"
          placeholder="Password"
          style={{ width: "100%", padding: "10px", marginTop: "15px" }}
        />

        <button
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            background: "#22c55e",
            color: "white",