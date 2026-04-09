const mysql2 = require("mysql2");

const pool = mysql2.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),
  ssl: { rejectUnauthorized: false },
  connectionLimit: 10,
});

pool.on("error", (error) => {
  console.error("MySQL pool error:", {
    code: error.code,
    message: error.message
  });
});

module.exports = pool;