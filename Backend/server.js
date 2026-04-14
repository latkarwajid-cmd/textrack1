require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { authUser } = require("./Utils/Auth");

// Route imports
const authRoutes = require("./routes/User");
const adminRoutes = require("./routes/Admin");
const productionRoutes = require("./routes/production");
const googleAuthRoutes = require("./routes/googleAuth");

// DB connection
const pool = require("./db/pool");

const app = express();


// =======================
// ✅ Middleware
// =======================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(express.json());


// =======================
// ✅ Database connection check
// =======================

pool.getConnection((err, connection) => {
  if (err) {
    console.log("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
    connection.release();
  }
});


// =======================
// ✅ PUBLIC ROUTES (No authentication required)
// =======================

app.use("/auth", googleAuthRoutes);   // Google login routes
app.use("/user", authRoutes);         // login / register routes


// =======================
// ✅ PROTECTED ROUTES (Require authentication)
// =======================

app.use(authUser);

app.use("/admin", adminRoutes);
app.use("/production", productionRoutes);


// =======================
// ✅ Health check route
// =======================

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Textile Tracking API Running Successfully"
  });
});


// =======================
// ✅ 404 handler
// =======================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});


// =======================
// ✅ Global error handler
// =======================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    message: "Internal Server Error"
  });
});


// =======================
// ✅ Start server
// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});