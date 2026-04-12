const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const pool = require("../db/pool"); // adjust path if needed

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Google token missing",
      });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    if (!email) {
      return res.status(400).json({
        error: "Google account email not available",
      });
    }

    // Check if user exists in parties table
    const [rows] = await pool.query(
      "SELECT id, email, role FROM parties WHERE email = ? AND is_active = 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        error: "Access denied. Contact admin.",
      });
    }

    const user = rows[0];

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Google login successful",
      data: {
        token: jwtToken,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      error: "Google authentication failed",
    });
  }
});

module.exports = router;