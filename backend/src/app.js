const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Health check: confirms the API is up AND the database is reachable.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'unreachable', detail: err.message });
  }
});

app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/stats', require('./routes/stats'));

app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Central error handler: turns thrown errors / DB constraint errors into JSON responses.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err.code === '23505') return res.status(409).json({ error: 'A product with this SKU already exists' });
  if (err.code === '23503') {
    return res.status(409).json({ error: 'This product has sales history and cannot be deleted' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
