import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./AdminNavbar.css";

function AdminNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="admin-nav">
      <div className="nav-header">
        <h2 className="nav-logo">TexTrack Admin</h2>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link
          className={isActive("/admin/parties") ? "active" : ""}
          to="/admin/parties"
          onClick={() => setMenuOpen(false)}
        >
          Parties
        </Link>

        <Link
          className={isActive("/admin/upload-excel") ? "active" : ""}
          to="/admin/upload-excel"
          onClick={() => setMenuOpen(false)}
        >
          Upload Excel File
        </Link>
      </div>
    </nav>
  );
}

export default AdminNavbar;