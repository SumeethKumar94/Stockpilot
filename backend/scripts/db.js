// Database helper:  node scripts/db.js <init|seed|reset>
//   init  - create tables if they do not exist
//   seed  - insert sample products (skips existing SKUs)
//   reset - DROP everything, recreate tables and insert sample products
const pool = require('../src/db');
const { runSqlFile, dropTables } = require('../src/dbSetup');

async function main() {
  const cmd = process.argv[2];
  if (!['init', 'seed', 'reset'].includes(cmd)) {
    console.error('Usage: node scripts/db.js <init|seed|reset>');
    process.exit(1);
  }

  if (cmd === 'reset') {
    await dropTables(pool);
    console.log('Dropped existing tables');
  }
  if (cmd === 'init' || cmd === 'reset') {
    await runSqlFile(pool, 'schema.sql');
    console.log('Schema applied (tables: products, sales)');
  }
  if (cmd === 'seed' || cmd === 'reset') {
    await runSqlFile(pool, 'seed.sql');
    console.log('Sample products inserted');
  }
}

main()
  .catch((err) => {
    console.error('\nDatabase command failed:', err.message || err.code || err);
    console.error('Check that PostgreSQL is running and DATABASE_URL in backend/.env is correct.');
    process.exitCode = 1;
  })
  .finally(() => pool.end());
