const router = require('express').Router();
const pool = require('../db');
const { httpError, parseId, positiveInt } = require('../utils');

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// GET /api/sales  -> most recent sales first, joined with product info
router.get(
  '/',
  wrap(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT s.id, s.product_id, p.name AS product_name, p.sku,
              s.quantity, s.unit_price, s.total_amount, s.customer_name, s.created_at
       FROM sales s
       JOIN products p ON p.id = s.product_id
       ORDER BY s.created_at DESC, s.id DESC
       LIMIT 200`
    );
    res.json(rows);
  })
);

// POST /api/sales  { product_id, quantity, customer_name? }
// Records the sale AND decreases the product's stock in ONE transaction.
router.post(
  '/',
  wrap(async (req, res) => {
    const productId = parseId(req.body?.product_id);
    const qty = positiveInt(req.body?.quantity, 'Quantity');
    const customer = String(req.body?.customer_name ?? '').trim().slice(0, 120) || null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock the product row so two simultaneous sales cannot oversell the stock.
      const found = await client.query(
        'SELECT id, name, price, quantity FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );
      if (!found.rows.length) throw httpError(404, 'Product not found');

      const product = found.rows[0];
      if (product.quantity < qty) {
        throw httpError(409, `Insufficient stock: only ${product.quantity} unit(s) of "${product.name}" available`);
      }

      const updated = await client.query(
        `UPDATE products SET quantity = quantity - $1, updated_at = NOW()
         WHERE id = $2 RETURNING quantity`,
        [qty, productId]
      );

      const total = Math.round(product.price * qty * 100) / 100;
      const sale = await client.query(
        `INSERT INTO sales (product_id, quantity, unit_price, total_amount, customer_name)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [productId, qty, product.price, total, customer]
      );

      await client.query('COMMIT');
      res.status(201).json({
        ...sale.rows[0],
        product_name: product.name,
        remaining_stock: updated.rows[0].quantity,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  })
);

module.exports = router;
