

const express = require("express");
const multer = require("multer");
const ExcelJS = require("exceljs");
const pool = require("../db/pool");
const { authUser, roleAuthorization } = require("../Utils/Auth");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/upload-excel",
  authUser,
  roleAuthorization(["admin"]),
  upload.single("file"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          error: "Missing file upload. Use form-data with key 'file'."
        });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);

      const sheet = workbook.getWorksheet(1);

      if (!sheet) {
        return res.status(400).json({ error: "Excel sheet not found" });
      }

      console.log(
        `Sheet name: ${sheet.name}, Rows: ${sheet.rowCount}`
      );

      const headerRow = sheet.getRow(1);

      const normalize = (s) =>
        (s || "")
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

      // detect party column
      const partyNameColumnIdx = headerRow.values.findIndex(
        (val) =>
          typeof val === "string" &&
          normalize(val).includes("party") &&
          normalize(val).includes("name")
      );

      if (partyNameColumnIdx === -1 && !req.body.party_id) {
        return res.status(400).json({
          error:
            "Excel must contain 'Party name' column OR provide party_id"
        });
      }

      // column mapping
      const columnAliases = {
        beam_receive_date: ["beamreceivedate"],
        picks: ["picks"],
        sizing_name: ["sizingname"],
        total_ends: ["totalends"],
        reed_count: ["reedcount"],
        reed_space: ["reedspace"],
        warp_ct: ["warpct"],
        weft_ct: ["weftct"],
        weave_finish: ["weavefinish"],
        flange_no: ["flangeno"],
        actual_beam: ["actualbeamlt"],
        beam_start_date: ["beamstartdate"],
        loom_no: ["loomno"],
        beam_fall: ["beamfall"],
        beam_status: ["beamstatus"]
      };

      const headerIndexes = {};

      Object.entries(columnAliases).forEach(([key, aliases]) => {
        const idx = headerRow.values.findIndex((val) => {
          if (typeof val !== "string") return false;
          const n = normalize(val);
          return aliases.some((alias) => n.includes(alias));
        });

        if (idx > 0) headerIndexes[key] = idx;
      });

      const parseExcelDate = (value) => {
        if (!value) return null;

        if (value instanceof Date) return value;

        if (typeof value === "number") {
          const utcDays = value - 25569;
          return new Date(utcDays * 86400 * 1000);
        }

        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
      };

      for (let i = 2; i <= sheet.rowCount; i++) {

        const row = sheet.getRow(i);

        let partyName = null;

        if (partyNameColumnIdx !== -1) {
          partyName = row.getCell(partyNameColumnIdx).value;
        }

        let partyId = req.body.party_id || null;

        // auto-create missing party
        if (!partyId) {

          if (!partyName || typeof partyName !== "string") {
            console.log(`Row ${i}: Missing party name`);
            continue;
          }

const partyResult = await new Promise((resolve, reject) => {
  pool.query(
    "SELECT id FROM parties WHERE party_name = ?",
    [partyName],
    (err, data) => err ? reject(err) : resolve(data)
  );
});

if (partyResult.length === 0) {
  console.log(`Party '${partyName}' not found, skipping row ${i}`);
  continue;
}

partyId = partyResult[0].id;
        }

        const values = [
          partyId,
          parseExcelDate(
            row.getCell(headerIndexes.beam_receive_date)?.value
          ),
          row.getCell(headerIndexes.picks)?.value || null,
          partyName,
          row.getCell(headerIndexes.sizing_name)?.value || null,
          row.getCell(headerIndexes.total_ends)?.value || null,
          row.getCell(headerIndexes.reed_count)?.value || null,
          row.getCell(headerIndexes.reed_space)?.value || null,
          row.getCell(headerIndexes.warp_ct)?.value || null,
          row.getCell(headerIndexes.weft_ct)?.value || null,
          row.getCell(headerIndexes.weave_finish)?.value || null,
          row.getCell(headerIndexes.flange_no)?.value || null,
          row.getCell(headerIndexes.actual_beam)?.value || null,
          parseExcelDate(
            row.getCell(headerIndexes.beam_start_date)?.value
          ),
          row.getCell(headerIndexes.loom_no)?.value || null,
          row.getCell(headerIndexes.beam_fall)?.value || null,
          row.getCell(headerIndexes.beam_status)?.value || null
        ];

await new Promise((resolve, reject) => {
  pool.query(
    `
    INSERT INTO loom_production (
      party_id,
      beam_receive_date,
      picks,
      party_name,
      sizing_name,
      total_ends,
      reed_count,
      reed_space,
      warp_ct,
      weft_ct,
      weave_finish,
      flange_no,
      actual_beam,
      beam_start_date,
      loom_no,
      beam_fall,
      beam_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON DUPLICATE KEY UPDATE
      beam_receive_date = VALUES(beam_receive_date),
      picks = VALUES(picks),
      party_name = VALUES(party_name),
      sizing_name = VALUES(sizing_name),
      total_ends = VALUES(total_ends),
      reed_count = VALUES(reed_count),
      reed_space = VALUES(reed_space),
      warp_ct = VALUES(warp_ct),
      weft_ct = VALUES(weft_ct),
      weave_finish = VALUES(weave_finish),
      flange_no = VALUES(flange_no),
      actual_beam = VALUES(actual_beam),
      beam_fall = VALUES(beam_fall),
      beam_status = VALUES(beam_status)
    `,
    values,
    (err) => (err ? reject(err) : resolve())
  );
});

      }

      res.json({
        message: "Excel uploaded successfully"
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "Excel upload failed"
      });

    }
  }
);



router.get(
  "/records",
  authUser,
  roleAuthorization(["partyOwner", "staff"]),
  (req, res) => {

    const partyId = req.user.party_id;

    console.log(`Fetching records for partyId: ${partyId}, user: ${req.user.id}, role: ${req.user.role}`);

    const sql = `
      SELECT
        beam_receive_date,
        
        picks,
        party_name,
        sizing_name,
        total_ends,
        reed_count,
        reed_space,
        warp_ct,
        weft_ct,
        weave_finish,
        flange_no,
        actual_beam,
        beam_start_date,
        loom_no,
        beam_fall,
        beam_status
        
      FROM loom_production
      WHERE party_id = ?
      ORDER BY id DESC
    `;

    pool.query(sql, [partyId], (error, data) => {

      if (error) {
        console.error("Fetch production records failed:", error);
        return res.status(500).json({
          error: "Database error while fetching records"
        });
      }

      console.log(`Found ${data.length} records for partyId ${partyId}`);

      res.json({
        message: "Records fetched successfully",
        data
      });

    });

  }
);

router.get("/export-excel", authUser, async (req, res) => {

  const partyId = req.user.party_id;

  const sql = `
    SELECT *
    FROM loom_production
    WHERE party_id = ?
  `;

  pool.query(sql, [partyId], async (err, rows) => {

    if (err) {
      return res.status(500).json({
        error: "Database error during export"
      });
    }

    // 🚨 IMPORTANT FIX
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: "No production data found for this party"
      });
    }

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Production Data");

    // create columns dynamically
    sheet.columns = Object.keys(rows[0]).map(key => ({
      header: key,
      key: key
    }));

    // insert rows
    rows.forEach(row => sheet.addRow(row));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=production.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  });

});

module.exports = router;