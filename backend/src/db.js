require('dotenv').config();
const { Pool, types } = require('pg');

// pg returns NUMERIC and BIGINT as strings by default; convert them to numbers.
types.setTypeParser(1700, (v) => parseFloat(v)); // NUMERIC
types.setTypeParser(20, (v) => parseInt(v, 10)); // BIGINT (COUNT, SUM of ints)

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://inventory_user:inventory_pass@localhost:5432/inventory_db',
});

module.exports = pool;
