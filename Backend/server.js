require("dotenv").config();

const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const path = require("path");

const { authUser } = require("./Utils/Auth");
const productionRoutes = require("./routes/production");
const { startWatcher } = require("./Utils/fileWatcher");

// Route imports
const authRoutes = require("./routes/User");
const adminRoutes = require("./routes/Admin");

// const partyRoutes = require("./routes/partyRoutes");
// const machineRoutes = require("./routes/machineRoutes");
// const orderRoutes = require("./routes/orderRoutes");

// DB connection (optional auto-check)
const pool = require("./db/pool");

const app = express();


// ✅ Middleware

app.use(cors({
  origin: "https://your-netlify-url.netlify.app"
}));

app.use(express.json());


// ✅ Database connection check

pool.getConnection((err, connection) => {
  if (err) {
    console.log("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
    connection.release();
  }
});


// ✅ Global authentication middleware
// (skips login/register automatically inside Auth.js)

app.use(authUser);


// ✅ Routes

app.use("/user", authRoutes);
app.use("/admin", adminRoutes);
app.use("/production", productionRoutes);



// app.use("/api/parties", partyRoutes);

// app.use("/api/machines", machineRoutes);

// app.use("/api/orders", orderRoutes);


// ✅ Health check route

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Textile Tracking API Running Successfully"
  });
});


// ✅ 404 handler

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// ✅ File Watcher: Auto-upload Excel files
startWatcher();

// ✅ Global error handler

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    message: "Internal Server Error"
  });
});


// ✅ Start server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});