import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AppHeader.css";

function AppHeader() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="brand">TexTrack</div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <nav className={`app-nav ${menuOpen ? "open" : ""}`}>
        <Link to="/home" onClick={() => setMenuOpen(false)}>
          Home
        </Link>

        {token && role === "admin" && (
          <Link
            to="/admin/parties"
            onClick={() => setMenuOpen(false)}
          >
            Admin
          </Link>
        )}

        {!token && (
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        )}

        {token && (
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default AppHeader;