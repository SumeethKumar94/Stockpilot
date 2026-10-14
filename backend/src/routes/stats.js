const router = require('express').Router();
const pool = require('../db');

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 10;

// GET /api/stats  -> numbers for the dashboard cards
router.get('/', async (req, res, next) => {
  try {
    const inventory = await pool.query(
      `SELECT COUNT(*)                                   AS total_products,
              COALESCE(SUM(quantity), 0)                 AS units_in_stock,
              COALESCE(SUM(quantity * price), 0)         AS inventory_value,
              COUNT(*) FILTER (WHERE quantity <= $1)     AS low_stock_count
       FROM products`,
      [LOW_STOCK_THRESHOLD]
    );
    const sales = await pool.query(
      `SELECT COUNT(*)                                                              AS total_sales,
              COALESCE(SUM(total_amount), 0)                                        AS total_revenue,
              COALESCE(SUM(total_amount) FILTER (WHERE created_at >= date_trunc('day', NOW())), 0) AS revenue_today
       FROM sales`
    );
    res.json({ ...inventory.rows[0], ...sales.rows[0], low_stock_threshold: LOW_STOCK_THRESHOLD });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
