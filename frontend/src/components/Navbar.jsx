import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
  ];

  return (
    <nav style={styles.navbar}>
      <a href="#home" style={styles.brand}>
        <span style={styles.logo}>✚</span>
        <span>
          <strong style={styles.brandName}>MediMatrix</strong>
          <span style={styles.brandAI}> AI</span>
          <small style={styles.tagline}>SMARTER HEALTHCARE</small>
        </span>
      </a>

      <button
        style={styles.menuButton}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div
        style={{
          ...styles.links,
          ...(menuOpen ? styles.mobileLinks : {}),
        }}
      >
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={styles.link}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}

        <a href="#login" style={styles.login}>
          Log in
        </a>

        <a href="#register" style={styles.register}>
          Get Started <span>↗</span>
        </a>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .unused {}
        }
      `}</style>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 6%",
    background: "#0b1519",
    borderBottom: "1px solid #24383a",
    color: "#f5faf9",
    position: "sticky",
    top: 0,
    zIndex: 100,
    fontFamily: "Arial, sans-serif",
    gap: "20px",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "inherit",
  },
  logo: {
    width: "43px",
    height: "43px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #49e0c0, #149b91)",
    color: "#071b1b",
    fontSize: "28px",
    fontWeight: "bold",
  },
  brandName: {
    fontSize: "21px",
    letterSpacing: "-0.6px",
  },
  brandAI: {
    color: "#49e0c0",
    fontWeight: "bold",
    fontSize: "20px",
  },
  tagline: {
    display: "block",
    marginTop: "4px",
    fontSize: "9px",
    letterSpacing: "2px",
    color: "#91aaa8",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "27px",
    flexWrap: "wrap",
  },
  link: {
    color: "#c0d0ce",
    textDecoration: "none",
    fontSize: "14px",
  },
  login: {
    color: "#f5faf9",
    textDecoration: "none",
    fontSize: "14px",
    padding: "11px 15px",
  },
  register: {
    color: "#071b1b",
    textDecoration: "none",
    background: "#49e0c0",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  menuButton: {
    display: "none",
    background: "transparent",
    color: "white",
    border: "1px solid #38504e",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "20px",
    cursor: "pointer",
  },
  mobileLinks: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
  },
};

export default Navbar;