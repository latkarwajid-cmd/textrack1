const mysql2 = require("mysql2");

const pool = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "manager",
  database: process.env.DB_NAME || "text_db",
  port: Number(process.env.DB_PORT || 3306),
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

pool.on("error", (error) => {
  console.error("MySQL pool error:", {
    code: error.code,
    message: error.message
  });
});

module.exports = pool;