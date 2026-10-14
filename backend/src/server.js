require('dotenv').config();
const app = require('./app');
const pool = require('./db');

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Inventory API running on http://localhost:${PORT}  (health: /api/health)`);
});

function shutdown() {
  server.close(() => pool.end().then(() => process.exit(0)));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
