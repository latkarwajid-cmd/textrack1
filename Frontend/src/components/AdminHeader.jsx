// import { Link, useNavigate } from "react-router-dom";

// function AdminHeader() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     navigate("/login", { replace: true });
//   };

//   return (
//     <header className="app-header">
//       <div className="brand">Textrack</div>
//       <nav className="app-nav">
//         <Link to="/home">Add Party</Link>
//         <Link to="/login">Modify Party</Link>
//         <Link to="/register">Delete party</Link>
//         <Link to="/register">Delete party</Link>
//         {token && (
//           <button type="button" className="logout-btn" onClick={handleLogout}>
//             Logout
//           </button>
//         )}
//       </nav>
//     </header>
//   );
// }

// export default AppHeader;
