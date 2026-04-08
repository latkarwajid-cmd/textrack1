const express = require("express");
const pool = require("../db/pool");

const { authUser, roleAuthorization } = require("../Utils/Auth");

const router = express.Router();


// ===============================
// ADMIN: ADD PRODUCTION RECORD
// ===============================

router.post(
  "/add",
  authUser,
  roleAuthorization(["admin"]),
  (req, res) => {

    const data = req.body;

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
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    pool.query(sql, Object.values(data), (err, result) => {

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


// ===============================
// PARTY OWNER: VIEW OWN DATA
// ===============================

router.get(
  "/my-data",
  authUser,
  (req, res) => {

    const partyId = req.user.id;

    const sql = `
      SELECT *
      FROM loom_production
      WHERE party_id = ?
      ORDER BY created_at DESC
    `;

    pool.query(sql, [partyId], (err, data) => {

      if (err) {
        return res.status(500).json({
          error: "Fetch failed"
        });
      }

      res.json(data);

    });

  }
);


// ===============================
// ADMIN: VIEW ALL DATA
// ===============================

router.get(
  "/all",
  authUser,
  roleAuthorization(["admin"]),
  (req, res) => {

    const sql = `
      SELECT lp.*, p.party_name
      FROM loom_production lp
      JOIN parties p
      ON lp.party_id = p.id
      ORDER BY lp.created_at DESC
    `;

    pool.query(sql, (err, data) => {

      if (err) {
        return res.status(500).json({
          error: "Fetch failed"
        });
      }

      res.json(data);

    });

  }
);


// ===============================
// ADMIN: UPDATE RECORD
// ===============================

router.put(
  "/update/:id",
  authUser,
  roleAuthorization(["admin"]),
  (req, res) => {

    const id = req.params.id;

    const {
      rpm,
      eff_percent,
      beam_status,
      remaining_cuts
    } = req.body;

    const sql = `
      UPDATE loom_production
      SET
        rpm = ?,
        eff_percent = ?,
        beam_status = ?,
        remaining_cuts = ?
      WHERE id = ?
    `;

    pool.query(
      sql,
      [rpm, eff_percent, beam_status, remaining_cuts, id],
      (err) => {

        if (err) {
          return res.status(500).json({
            error: "Update failed"
          });
        }

        res.json({
          message: "Record updated successfully"
        });

      }
    );

  }
);


// ===============================
// ADMIN: DELETE RECORD
// ===============================

router.delete(
  "/delete/:id",
  authUser,
  roleAuthorization(["admin"]),
  (req, res) => {

    const sql = `
      DELETE FROM loom_production
      WHERE id = ?
    `;

    pool.query(sql, [req.params.id], (err) => {

      if (err) {
        return res.status(500).json({
          error: "Delete failed"
        });
      }

      res.json({
        message: "Record deleted"
      });

    });

  }
);


// ===============================
// PARTY OWNER: FILTER BY LOOM NO
// ===============================

router.get(
  "/loom/:loomNo",
  authUser,
  (req, res) => {

    const sql = `
      SELECT *
      FROM loom_production
      WHERE party_id = ?
      AND loom_no = ?
    `;

    pool.query(
      sql,
      [req.user.id, req.params.loomNo],
      (err, data) => {

        if (err) {
          return res.status(500).json({
            error: "Fetch failed"
          });
        }

        res.json(data);

      }
    );

  }
);


module.exports = router;