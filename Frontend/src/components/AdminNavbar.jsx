import { Link, useLocation } from "react-router-dom";

function AdminNavbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="admin-nav">
      <Link className={isActive("/admin/parties") ? "active" : ""} to="/admin/parties">
        Parties
      </Link>

      <Link className={isActive("/admin/upload-excel") ? "active" : ""} to="/admin/upload-excel">
        Upload Excel File
      </Link>

    </nav>
  );
}

export default AdminNavbar;
