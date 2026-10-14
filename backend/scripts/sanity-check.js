// End-to-end sanity check against a RUNNING API (and its database).
//   npm run sanity                      -> checks http://localhost:3000
//   API_URL=http://host:3000 npm run sanity
// It creates a temporary product, sells part of it, verifies the stock decreased,
// verifies overselling is rejected, then cleans up after itself.
require('dotenv').config();

const API = (process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
let failures = 0;

function check(name, ok, detail = '') {
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${ok ? '' : detail ? `  -> ${detail}` : ''}`);
  if (!ok) failures += 1;
}

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function main() {
  console.log(`Running sanity checks against ${API}\n`);

  let health;
  try {
    health = await call('GET', '/api/health');
  } catch (err) {
    console.error(`Cannot reach the API at ${API}. Start it with "npm start" first.`);
    process.exit(1);
  }
  check('API health endpoint returns 200', health.status === 200, JSON.stringify(health.body));
  check('Database is connected', health.body?.database === 'connected');

  const sku = `SANITY-${Date.now()}`;
  const created = await call('POST', '/api/products', { sku, name: 'Sanity Check Item', category: 'Test', price: 10, quantity: 10 });
  check('Create product returns 201', created.status === 201, JSON.stringify(created.body));
  const id = created.body?.id;

  const dup = await call('POST', '/api/products', { sku, name: 'Duplicate', price: 1, quantity: 1 });
  check('Duplicate SKU is rejected (409)', dup.status === 409);

  const bad = await call('POST', '/api/products', { sku: 'X', name: '', price: -5 });
  check('Invalid product is rejected (400)', bad.status === 400);

  const sale = await call('POST', '/api/sales', { product_id: id, quantity: 3, customer_name: 'Sanity Bot' });
  check('Create sale returns 201', sale.status === 201, JSON.stringify(sale.body));
  check('Sale total is correct (3 x 10 = 30)', sale.body?.total_amount === 30);

  const after = await call('GET', `/api/products/${id}`);
  check('Stock decreased from 10 to 7 after the sale', after.body?.quantity === 7, `quantity=${after.body?.quantity}`);

  const oversell = await call('POST', '/api/sales', { product_id: id, quantity: 8 });
  check('Overselling is rejected (409)', oversell.status === 409);

  const unchanged = await call('GET', `/api/products/${id}`);
  check('Stock unchanged (still 7) after rejected sale', unchanged.body?.quantity === 7);

  const stats = await call('GET', '/api/stats');
  check('Stats endpoint returns 200', stats.status === 200);

  // Clean up the temporary records directly in the database.
  try {
    const pool = require('../src/db');
    await pool.query('DELETE FROM sales WHERE product_id = $1', [id]);
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    await pool.end();
    console.log('\n  (temporary sanity records removed)');
  } catch (err) {
    console.log(`\n  (could not clean up the "${sku}" product automatically: ${err.message})`);
  }

  console.log(failures === 0 ? '\nAll sanity checks passed.' : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
