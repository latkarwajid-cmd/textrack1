const pool = require('./db/pool');

pool.query("SHOW COLUMNS FROM loom_production LIKE 'beam_receive_date'", (err, results) => {
  if (err) {
    console.error('Error checking column:', err);
    process.exit(1);
  }

  if (results.length > 0) {
    console.log('Column beam_receive_date already exists.');
    pool.end();
    return;
  }

  pool.query("ALTER TABLE loom_production ADD COLUMN beam_receive_date DATE NULL AFTER party_id", (err2) => {
    if (err2) {
      console.error('Error adding column:', err2);
      process.exit(1);
    }
    console.log('Column beam_receive_date added successfully.');
    pool.end();
  });
});
