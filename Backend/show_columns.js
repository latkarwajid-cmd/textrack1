const pool = require('./db/pool');
pool.query('SHOW COLUMNS FROM loom_production', (err, cols) => {
  if (err) {
    console.error('ERROR', err);
    pool.end();
    process.exit(1);
  }
  console.table(cols);
  pool.end();
});
