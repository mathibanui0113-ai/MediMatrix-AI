function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 60px",
        backgroundColor: "#0F172A",
        color: "white",
      }}
    >
      <h2>🏥 MediMatrix AI</h2>

      <div>
        <button style={{ marginRight: "10px" }}>Login</button>
        <button>Register</button>
      </div>
    </nav>
  );
}

export default Navbar;