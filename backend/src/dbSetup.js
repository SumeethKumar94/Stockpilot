const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '..', '..', 'database');

/** Runs a .sql file from the /database folder (multi-statement files are fine). */
async function runSqlFile(pool, fileName) {
  const sql = fs.readFileSync(path.join(DB_DIR, fileName), 'utf8');
  await pool.query(sql);
}

/** Drops both tables (used by `db:reset` and by the tests). */
async function dropTables(pool) {
  await pool.query('DROP TABLE IF EXISTS sales, products CASCADE');
}

module.exports = { runSqlFile, dropTables };
