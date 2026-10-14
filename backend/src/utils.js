function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/** Parses a route id like "/products/12"; throws 400 when it is not a positive integer. */
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw httpError(400, 'Invalid id');
  return id;
}

const isBlank = (v) => v === undefined || v === null || v === '';

/** Validates and normalises a product payload (used by create + update). */
function validateProduct(body = {}) {
  const sku = String(body.sku ?? '').trim().toUpperCase();
  const name = String(body.name ?? '').trim();
  const category = String(body.category ?? '').trim() || 'General';

  if (!sku) throw httpError(400, 'SKU is required');
  if (sku.length > 50) throw httpError(400, 'SKU must be 50 characters or fewer');
  if (!name) throw httpError(400, 'Product name is required');
  if (name.length > 150) throw httpError(400, 'Product name must be 150 characters or fewer');

  if (isBlank(body.price)) throw httpError(400, 'Price is required');
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) throw httpError(400, 'Price must be a number >= 0');

  const quantity = isBlank(body.quantity) ? 0 : Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw httpError(400, 'Quantity must be a whole number >= 0');
  }

  return { sku, name, category, price: Math.round(price * 100) / 100, quantity };
}

/** Validates a positive whole number such as a sale / restock quantity. */
function positiveInt(value, label) {
  const n = Number(value);
  if (isBlank(value) || !Number.isInteger(n) || n <= 0) {
    throw httpError(400, `${label} must be a whole number greater than 0`);
  }
  return n;
}

module.exports = { httpError, parseId, validateProduct, positiveInt };
