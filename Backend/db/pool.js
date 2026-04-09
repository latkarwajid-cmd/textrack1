const mysql2 = require("mysql2");

const pool = mysql2.createPool({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "manager",
  database: process.env.MYSQLDATABASE || "text_db",
  port: Number(process.env.MYSQLPORT || 3306),

  ssl: {
    rejectUnauthorized: false
  },

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