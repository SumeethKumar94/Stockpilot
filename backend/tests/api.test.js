// Integration tests - they talk to a REAL PostgreSQL database (TEST_DATABASE_URL).
// The tables in that database are DROPPED and recreated before the tests run.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgres://inventory_user:inventory_pass@localhost:5432/inventory_test_db';

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');
const { runSqlFile, dropTables } = require('../src/dbSetup');

const api = () => request(app);

async function addProduct(overrides = {}) {
  const res = await api()
    .post('/api/products')
    .send({ sku: `T-${Math.random().toString(36).slice(2, 8)}`, name: 'Test Item', category: 'Test', price: 25, quantity: 10, ...overrides });
  return res.body;
}

beforeAll(async () => {
  await dropTables(pool);
  await runSqlFile(pool, 'schema.sql');
});

afterAll(async () => {
  await pool.end();
});

describe('health', () => {
  test('reports API and database as healthy', async () => {
    const res = await api().get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'connected' });
  });
});

describe('products', () => {
  test('creates a product and returns it with numeric price', async () => {
    const res = await api().post('/api/products').send({ sku: 'abc-1', name: 'Widget', category: 'Parts', price: 12.5, quantity: 4 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ sku: 'ABC-1', name: 'Widget', price: 12.5, quantity: 4 });
  });

  test('rejects a duplicate SKU with 409', async () => {
    const res = await api().post('/api/products').send({ sku: 'ABC-1', name: 'Other', price: 1, quantity: 1 });
    expect(res.status).toBe(409);
  });

  test.each([
    [{ name: 'No sku', price: 1 }, 'SKU'],
    [{ sku: 'V1', price: 1 }, 'name'],
    [{ sku: 'V2', name: 'Neg price', price: -1 }, 'Price'],
    [{ sku: 'V3', name: 'Bad qty', price: 1, quantity: 1.5 }, 'Quantity'],
  ])('rejects invalid payload %j with 400', async (payload, word) => {
    const res = await api().post('/api/products').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain(word);
  });

  test('lists and searches products', async () => {
    await addProduct({ sku: 'FIND-ME', name: 'Searchable Gadget' });
    const all = await api().get('/api/products');
    expect(all.status).toBe(200);
    expect(all.body.length).toBeGreaterThan(1);
    const found = await api().get('/api/products').query({ search: 'searchable' });
    expect(found.body.map((p) => p.sku)).toEqual(['FIND-ME']);
  });

  test('updates a product', async () => {
    const p = await addProduct();
    const res = await api().put(`/api/products/${p.id}`).send({ ...p, name: 'Renamed', price: 99 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Renamed', price: 99 });
  });

  test('restocks a product', async () => {
    const p = await addProduct({ quantity: 5 });
    const res = await api().post(`/api/products/${p.id}/restock`).send({ quantity: 7 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(12);
    const bad = await api().post(`/api/products/${p.id}/restock`).send({ quantity: 0 });
    expect(bad.status).toBe(400);
  });

  test('returns 404 for unknown product and 400 for bad id', async () => {
    expect((await api().get('/api/products/999999')).status).toBe(404);
    expect((await api().get('/api/products/abc')).status).toBe(400);
  });

  test('deletes a product that has no sales', async () => {
    const p = await addProduct();
    expect((await api().delete(`/api/products/${p.id}`)).status).toBe(204);
    expect((await api().get(`/api/products/${p.id}`)).status).toBe(404);
  });
});

describe('sales', () => {
  test('a sale decreases the product stock and stores the total', async () => {
    const p = await addProduct({ price: 20, quantity: 10 });
    const res = await api().post('/api/sales').send({ product_id: p.id, quantity: 4, customer_name: 'Alice' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ quantity: 4, unit_price: 20, total_amount: 80, remaining_stock: 6, customer_name: 'Alice' });

    const after = await api().get(`/api/products/${p.id}`);
    expect(after.body.quantity).toBe(6);
  });

  test('overselling is rejected and leaves stock untouched', async () => {
    const p = await addProduct({ quantity: 3 });
    const res = await api().post('/api/sales').send({ product_id: p.id, quantity: 4 });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/insufficient stock/i);

    const after = await api().get(`/api/products/${p.id}`);
    expect(after.body.quantity).toBe(3);
    const sales = await api().get('/api/sales');
    expect(sales.body.find((s) => s.product_id === p.id)).toBeUndefined();
  });

  test('selling the exact remaining stock brings it to zero', async () => {
    const p = await addProduct({ quantity: 2 });
    const res = await api().post('/api/sales').send({ product_id: p.id, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.remaining_stock).toBe(0);
  });

  test('concurrent sales never oversell', async () => {
    const p = await addProduct({ quantity: 5 });
    const results = await Promise.all(
      Array.from({ length: 8 }, () => api().post('/api/sales').send({ product_id: p.id, quantity: 1 }))
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(5);
    expect(results.filter((r) => r.status === 409)).toHaveLength(3);
    const after = await api().get(`/api/products/${p.id}`);
    expect(after.body.quantity).toBe(0);
  });

  test('validates the payload and unknown products', async () => {
    const p = await addProduct();
    expect((await api().post('/api/sales').send({ product_id: p.id, quantity: 0 })).status).toBe(400);
    expect((await api().post('/api/sales').send({ product_id: p.id })).status).toBe(400);
    expect((await api().post('/api/sales').send({ quantity: 1 })).status).toBe(400);
    expect((await api().post('/api/sales').send({ product_id: 999999, quantity: 1 })).status).toBe(404);
  });

  test('lists sales with product name, newest first', async () => {
    const p = await addProduct({ name: 'Listed Product' });
    await api().post('/api/sales').send({ product_id: p.id, quantity: 1 });
    const res = await api().get('/api/sales');
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ product_id: p.id, product_name: 'Listed Product' });
  });

  test('a product with sales history cannot be deleted', async () => {
    const p = await addProduct();
    await api().post('/api/sales').send({ product_id: p.id, quantity: 1 });
    const res = await api().delete(`/api/products/${p.id}`);
    expect(res.status).toBe(409);
  });
});

describe('stats', () => {
  test('returns dashboard numbers', async () => {
    const res = await api().get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        total_products: expect.any(Number),
        units_in_stock: expect.any(Number),
        inventory_value: expect.any(Number),
        low_stock_count: expect.any(Number),
        total_sales: expect.any(Number),
        total_revenue: expect.any(Number),
        revenue_today: expect.any(Number),
        low_stock_threshold: expect.any(Number),
      })
    );
    expect(res.body.total_sales).toBeGreaterThan(0);
  });
});
