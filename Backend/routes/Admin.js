const express = require("express");
const pool = require("../db/pool");
const result = require("../Utils/Result");
const { roleAuthorization, authUser } = require("../Utils/Auth");
const cryptojs = require("crypto-js");

const router = express.Router();


/*
CREATE PARTY USER (admin creates partyOwner/staff)
*/
router.post("/parties",authUser, roleAuthorization(["admin"]), (req, res) => {

  const { party_name, name, email, password, role } = req.body;

  if (!party_name || !name || !email || !role) {
    return res.status(400).json(
      result.createResult("party_name, name, email, role required")
    );
  }

  const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "Welcome@123";

  const hashedPass = cryptojs
    .SHA256(password || defaultPassword)
    .toString();

  const sql = `
    INSERT INTO parties
    (party_name, name, email, password, role, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `;

  pool.query(
    sql,
    [party_name, name, email, hashedPass, role],
    (error, data) => {

      if (error) {
        console.error(error);
        return res.status(500).json(
          result.createResult("Database error while creating party")
        );
      }

      res.status(201).json(
        result.createResult(null, {
          id: data.insertId,
          party_name,
          name,
          email,
          role,
          default_password: password ? null : defaultPassword
        })
      );

    }
  );

});


/*
GET ALL ACTIVE PARTIES
*/
router.get("/parties",authUser, roleAuthorization(["admin"]), (req, res) => {

  const sql = `
    SELECT id, party_name, name, email, role
    FROM parties
    WHERE is_active = 1
    ORDER BY id DESC
  `;

  pool.query(sql, (error, data) => {

    if (error) {
      return res.status(500).json(
        result.createResult("Database error while fetching parties")
      );
    }

    res.json(result.createResult(null, data));

  });

});


/*
GET PARTY BY ID
*/
router.get("/parties/:id",authUser, roleAuthorization(["admin"]), (req, res) => {

  const sql = `
    SELECT id, party_name, name, email, role
    FROM parties
    WHERE id = ? AND is_active = 1
  `;

  pool.query(sql, [req.params.id], (error, data) => {

    if (error) {
      return res.status(500).json(
        result.createResult("Database error while fetching party")
      );
    }

    if (data.length === 0) {
      return res.status(404).json(
        result.createResult("Party not found")
      );
    }

    res.json(result.createResult(null, data[0]));

  });

});


/*
UPDATE PARTY
*/
router.put("/parties/:id", authUser,roleAuthorization(["admin"]), (req, res) => {

  const { party_name, name, email } = req.body;

  if (!party_name || !name || !email) {
    return res.status(400).json(
      result.createResult("party_name, name, email required")
    );
  }

  const sql = `
    UPDATE parties
    SET party_name=?, name=?, email=?
    WHERE id=? AND is_active=1
  `;

  pool.query(
    sql,
    [party_name, name, email, req.params.id],
    (error, data) => {

      if (error) {
        return res.status(500).json(
          result.createResult("Database error while updating party")
        );
      }

      if (data.affectedRows === 0) {
        return res.status(404).json(
          result.createResult("Party not found")
        );
      }

      res.json(result.createResult("Party updated"));

    }
  );

});


/*
SOFT DELETE PARTY
*/
router.delete("/parties/:id",authUser, roleAuthorization(["admin"] ), (req, res) => {

  const sql = `
    UPDATE parties
    SET is_active = 0
    WHERE id=? AND is_active=1
  `;

  pool.query(sql, [req.params.id], (error, data) => {

    if (error) {
      return res.status(500).json(
        result.createResult("Database error while deleting party")
      );
    }

    if (data.affectedRows === 0) {
      return res.status(404).json(
        result.createResult("Party not found")
      );
    }

    res.json(result.createResult("Party deleted"));

  });

});
  


// ===============================
// ADMIN: ADD PRODUCTION RECORD
// ===============================

router.post(
  "/add",
  authUser,
  roleAuthorization(["admin"]),
  (req, res) => {

    const data = req.body;

    const orderedFields = [
      "party_id",
      "beam_receive_date",
      "beam_sr_no",
      "picks",
      "job_rate",
      "party_name",
      "beam_size",
      "target_grey",
      "yd_wh",
      "sizing_name",
      "total_ends",
      "No_shafts_rolls",
      "reed_count",
      "reed_space",
      "warp_ct",
      "weft_ct",
      "weave_finish",
      "type_of_beam",
      "flange_no",
      "actual_beam",
      "rpm",
      "eff_percent",
      "per_day_production",
      "on_loom_days",
      "targeted_beam_fall_date",
      "beam_start_date",
      "loom_no",
      "first_beam_fall_date",
      "beam_fall",
      "beam_status",
      "remaining_cuts",
      "panna",
      "quality"
    ];

    const values = orderedFields.map(field => data[field]);

    const sql = `
      INSERT INTO loom_production (
        party_id,
        beam_receive_date,
        beam_sr_no,
        picks,
        job_rate,
        party_name,
        beam_size,
        target_grey,
        yd_wh,
        sizing_name,
        total_ends,
        No_shafts_rolls,
        reed_count,
        reed_space,
        warp_ct,
        weft_ct,
        weave_finish,
        type_of_beam,
        flange_no,
        actual_beam,
        rpm,
        eff_percent,
        per_day_production,
        on_loom_days,
        targeted_beam_fall_date,
        beam_start_date,
        loom_no,
        first_beam_fall_date,
        beam_fall,
        beam_status,
        remaining_cuts,
        panna,
        quality
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    pool.query(sql, values, (err, result) => {

      if (err) {
        return res.status(500).json({
          error: "Insert failed"
        });
      }

      res.json({
        message: "Production record inserted",
        id: result.insertId
      });

    });

  }
);


module.exports = router;