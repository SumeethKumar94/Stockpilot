const router = require('express').Router();
const pool = require('../db');
const { httpError, parseId, validateProduct, positiveInt } = require('../utils');

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// GET /api/products?search=term
router.get(
  '/',
  wrap(async (req, res) => {
    const search = String(req.query.search ?? '').trim();
    const { rows } = search
      ? await pool.query(
          `SELECT * FROM products
           WHERE name ILIKE $1 OR sku ILIKE $1 OR category ILIKE $1
           ORDER BY name`,
          [`%${search}%`]
        )
      : await pool.query('SELECT * FROM products ORDER BY name');
    res.json(rows);
  })
);

// GET /api/products/:id
router.get(
  '/:id',
  wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [parseId(req.params.id)]);
    if (!rows.length) throw httpError(404, 'Product not found');
    res.json(rows[0]);
  })
);

// POST /api/products  -> add a product to the inventory
router.post(
  '/',
  wrap(async (req, res) => {
    const p = validateProduct(req.body);
    const { rows } = await pool.query(
      `INSERT INTO products (sku, name, category, price, quantity)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [p.sku, p.name, p.category, p.price, p.quantity]
    );
    res.status(201).json(rows[0]);
  })
);

// PUT /api/products/:id  -> edit a product (also used for stock corrections)
router.put(
  '/:id',
  wrap(async (req, res) => {
    const id = parseId(req.params.id);
    const p = validateProduct(req.body);
    const { rows } = await pool.query(
      `UPDATE products
       SET sku = $1, name = $2, category = $3, price = $4, quantity = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [p.sku, p.name, p.category, p.price, p.quantity, id]
    );
    if (!rows.length) throw httpError(404, 'Product not found');
    res.json(rows[0]);
  })
);

// POST /api/products/:id/restock  { quantity }  -> add stock to an existing product
router.post(
  '/:id/restock',
  wrap(async (req, res) => {
    const id = parseId(req.params.id);
    const qty = positiveInt(req.body?.quantity, 'Quantity');
    const { rows } = await pool.query(
      `UPDATE products SET quantity = quantity + $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [qty, id]
    );
    if (!rows.length) throw httpError(404, 'Product not found');
    res.json(rows[0]);
  })
);

// DELETE /api/products/:id  (blocked by the DB when the product has sales)
router.delete(
  '/:id',
  wrap(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [parseId(req.params.id)]);
    if (!rowCount) throw httpError(404, 'Product not found');
    res.status(204).end();
  })
);

module.exports = router;
