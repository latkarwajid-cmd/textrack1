import { Link, useNavigate } from "react-router-dom";

function AppHeader() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="brand">Textrack</div>
      <nav className="app-nav">
        <Link to="/home">Home</Link>
        {token && role === "admin" && <Link to="/admin/parties">Admin</Link>}
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        {token && (
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default AppHeader;
