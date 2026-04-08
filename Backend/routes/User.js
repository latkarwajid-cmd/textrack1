const express = require("express");
const pool = require("../db/pool");
const result = require("../Utils/Result");
const cryptojs = require("crypto-js");
const jwt = require("jsonwebtoken");
const config = require("../Utils/Config");


const router = express.Router();


router.post("/login", (req, res) => {

  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json(result.createResult("Email and password are required"));
  }

  const hashedPass = cryptojs.SHA256(password).toString();

  const sql = "SELECT * FROM parties WHERE email = ? AND password = ?";

  pool.query(sql, [email, hashedPass], (error, data) => {

    if (error) {
      console.error("Login query failed:", {
        code: error.code,
        sqlState: error.sqlState,
        message: error.message
      });
      return res
        .status(500)
        .json(result.createResult("Database error while logging in"));
    }

    if (data.length === 0) {
      return res
        .status(401)
        .json(result.createResult("Invalid email or password"));
    }

    const user = data[0];

    // JWT payload
    const payload = {
      email: user.email,
      role: user.role,
      party_id: user.id   // Use user.id as party_id for parties
    };

    const token = jwt.sign(payload, config.SECRET, {
      expiresIn: "1d"
    });

    const userData = {
      role: user.role,
      party_id: user.party_id,
      token
    };

    return res.json(result.createResult(null, userData));

  });

});


module.exports = router;