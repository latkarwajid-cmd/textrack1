import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminUpload from "./pages/admin/AdminUpload";
import Parties from "./pages/admin/Parties";
import ProductionRecords from "./pages/ProductionRecords";

import "./App.css";

function App() {

  const token = localStorage.getItem("token");

  return (
    <Router>
      <div className="app-layout">
        <AppHeader />

        <section className="app-content">
          <Routes>

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Redirect root */}
            <Route
              path="/"
              element={
                token
                  ? <Navigate to="/home" replace />
                  : <Navigate to="/login" replace />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/production-records"
              element={
                <ProtectedRoute>
                  <ProductionRecords />
                </ProtectedRoute>
              }
            />

            {/* Admin-only Routes */}
            <Route
              path="/admin/parties"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Parties />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/upload-excel"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUpload />
                </ProtectedRoute>
              }
            />

          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;