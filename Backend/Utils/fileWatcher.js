const chokidar = require('chokidar');
const path = require('path');
const ExcelJS = require('exceljs');
const pool = require('../db/pool');
const fs = require('fs');

// Helper: Get party_id from party_name
const getPartyIdFromName = async (partyName) => {
  if (!partyName || partyName.trim() === '') return null;
  
  try {
    const result = await new Promise((resolve, reject) => {
      pool.query(
        'SELECT id FROM parties WHERE LOWER(party_name) = LOWER(?)',
        [partyName.trim()],
        (err, data) => (err ? reject(err) : resolve(data))
      );
    });
    
    return result.length > 0 ? result[0].id : null;
  } catch (err) {
    console.error(`❌ Error looking up party by name "${partyName}": ${err.message}`);
    return null;
  }
};

// Helper: Parse Excel date
const parseExcelDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const serial = value;
    const utcDays = serial - 25569;
    const utcValue = Math.round(utcDays * 86400 * 1000);
    return new Date(utcValue);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Main: Process Excel file and insert to DB
const processExcelFile = async (filePath) => {
  console.log(`\n📋 Processing file: ${path.basename(filePath)}`);

  try {
    const filename = path.basename(filePath);
    
    // Only process loom_data.xlsx
    if (!filename.toLowerCase().includes('loom_data')) {
      console.warn(`⚠️ Skipping file (expected loom_data.xlsx): ${filename}`);
      return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1);

    if (!sheet) {
      console.warn('⚠️ No worksheet found in Excel file');
      return;
    }

    console.log(`✅ Processing loom_data.xlsx`);

    // Parse headers with aliases (same as production.js)
    const headerRow = sheet.getRow(1);
    const normalize = (s) =>
      (s || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const columnAliases = {
      beam_receive_date: ['beamreceivedate', 'beam_receive_date', 'beam receive date'],
      picks: ['picks'],
      party_name: ['partyname', 'party_name', 'party name'],
      
      sizing_name: ['sizingname', 'sizing_name', 'sizing name'],
      total_ends: ['totalends', 'total_ends', 'total ends'],
      reed_count: ['reedcount', 'reed_count', 'reed count'],
      reed_space: ['reedspace', 'reed_space', 'reed space'],
      warp_ct: ['warpct', 'warp_ct', 'warp ct'],
      weft_ct: ['weftct', 'weft_ct', 'weft ct'],
      weave_finish: ['weavefinish', 'weave_finish', 'weave finish'],
      flange_no: ['flangeno', 'flange_no', 'flange no'],
      actual_beam: ['actualbeam', 'actual_beam', 'actual beam', 'actual beam lt'],
     
      
      beam_start_date: ['beamstartdate', 'beam_start_date', 'beam start date'],
      loom_no: ['loomno', 'loom_no', 'loom no'],
      beam_fall: ['beamfall', 'beam_fall', 'beam fall'],
      beam_status: ['beamstatus', 'beam_status', 'beam status']
   
    };

    const headerIndexes = {};
    Object.entries(columnAliases).forEach(([key, aliases]) => {
      const idx = headerRow.values.findIndex((val) => {
        if (typeof val !== 'string') return false;
        const n = normalize(val);
        return aliases.some((alias) => n.includes(alias));
      });
      if (idx > 0) headerIndexes[key] = idx;
    });

    console.log(`📊 Found ${Object.keys(headerIndexes).length} mapped columns`);

    // Process rows
    const orderedFields = [
      'beam_receive_date',
      
      'picks',
      'party_name',
   
      'sizing_name',
      'total_ends',
      'reed_count',
      'reed_space',
      'warp_ct',
      'weft_ct',
      'weave_finish',
      'flange_no',
      'actual_beam',
     
    
      'beam_start_date',
      'loom_no',
      'beam_fall',
      'beam_status'
  
    ];

    const dateFields = new Set(['beam_receive_date', 'targeted_beam_fall_date', 'beam_start_date', 'first_beam_fall_date']);
    const numFields = new Set(['picks',  'total_ends',  'reed_count', 'warp_ct', 'weft_ct', 'flange_no', 'actual_beam', 'loom_no']);

    let insertedCount = 0;
    let skippedCount = 0;

    // IMPORTANT: Process rows and get party_id from party_name column in each row
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      
      // Get party_name from the Excel row
      const partyNameRaw = headerIndexes['party_name'] 
        ? row.getCell(headerIndexes['party_name']).value 
        : null;
      
      if (!partyNameRaw) {
        console.log(`⚠️ Row ${i}: No party_name found, skipping`);
        skippedCount++;
        continue;
      }

      // Look up party_id based on party_name
      const partyId = await getPartyIdFromName(partyNameRaw);
      if (!partyId) {
        console.log(`⚠️ Row ${i}: Cannot find party "${partyNameRaw}" in database, skipping`);
        skippedCount++;
        continue;
      }

      const values = [partyId];

      for (let idx = 0; idx < orderedFields.length; idx++) {
        const field = orderedFields[idx];
        let raw = null;

        if (headerIndexes[field]) {
          raw = row.getCell(headerIndexes[field]).value;
        }

        if (raw === null || raw === undefined || raw === '') {
          values.push(null);
          continue;
        }

        if (dateFields.has(field)) {
          values.push(parseExcelDate(raw));
          continue;
        }

        if (numFields.has(field) && typeof raw === 'string') {
          const cleaned = raw.toString().replace(/[\s,%]/g, '');
          const num = Number(cleaned);
          values.push(Number.isNaN(num) ? raw : num);
          continue;
        }

        values.push(raw);
      }

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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        beam_receive_date = VALUES(beam_receive_date),
        beam_sr_no = VALUES(beam_sr_no),
        picks = VALUES(picks),
        job_rate = VALUES(job_rate),
        party_name = VALUES(party_name),
        beam_size = VALUES(beam_size),
        target_grey = VALUES(target_grey),
        yd_wh = VALUES(yd_wh),
        sizing_name = VALUES(sizing_name),
        total_ends = VALUES(total_ends),
        No_shafts_rolls = VALUES(No_shafts_rolls),
        reed_count = VALUES(reed_count),
        reed_space = VALUES(reed_space),
        warp_ct = VALUES(warp_ct),
        weft_ct = VALUES(weft_ct),
        weave_finish = VALUES(weave_finish),
        type_of_beam = VALUES(type_of_beam),
        flange_no = VALUES(flange_no),
        actual_beam = VALUES(actual_beam),
        rpm = VALUES(rpm),
        eff_percent = VALUES(eff_percent),
        per_day_production = VALUES(per_day_production),
        on_loom_days = VALUES(on_loom_days),
        targeted_beam_fall_date = VALUES(targeted_beam_fall_date),
        beam_start_date = VALUES(beam_start_date),
        loom_no = VALUES(loom_no),
        first_beam_fall_date = VALUES(first_beam_fall_date),
        beam_fall = VALUES(beam_fall),
        beam_status = VALUES(beam_status),
        remaining_cuts = VALUES(remaining_cuts),
        panna = VALUES(panna),
        quality = VALUES(quality);
      `;

      await new Promise((resolve, reject) => {
        pool.query(sql, values, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      insertedCount++;
    }

    console.log(`✅ Successfully processed: ${insertedCount} rows inserted/updated, ${skippedCount} rows skipped`);
  } catch (err) {
    console.error(`❌ Error processing Excel file: ${err.message}`);
    console.error(err);
  }
};

// Start file watcher
const startWatcher = (watchDir = path.resolve(__dirname, '../uploads/excel')) => {
  // Ensure directory exists
  if (!fs.existsSync(watchDir)) {
    fs.mkdirSync(watchDir, { recursive: true });
  }

  console.log(`\n👀 Starting file watcher for: ${watchDir}`);

  const watcher = chokidar.watch(`${watchDir}/**/*.xlsx`, {
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 3000,
      pollInterval: 100
    },
    ignored: /^\./,
    usePolling: true,
    interval: 1000,
    binaryInterval: 1000
  });

  watcher
    .on('add', (filePath) => {
      console.log(`\n📥 New file detected: ${path.basename(filePath)}`);
      processExcelFile(filePath).catch((err) =>
        console.error('Error in watcher:', err)
      );
    })
    .on('change', (filePath) => {
      console.log(`\n♻️ File modified: ${path.basename(filePath)}`);
      processExcelFile(filePath).catch((err) =>
        console.error('Error in watcher:', err)
      );
    })
    .on('error', (err) => {
      console.error(`❌ Watcher error:`, err);
    });

  return watcher;
};

module.exports = { startWatcher, processExcelFile };
