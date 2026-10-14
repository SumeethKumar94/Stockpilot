-- ---------------------------------------------------------------
-- Inventory schema (idempotent: safe to run multiple times)
-- Applied with:  npm run db:init   (from the backend folder)
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  sku         VARCHAR(50)   NOT NULL UNIQUE,
  name        VARCHAR(150)  NOT NULL,
  category    VARCHAR(80)   NOT NULL DEFAULT 'General',
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity    INTEGER       NOT NULL DEFAULT 0 CHECK (quantity >= 0),   -- current stock
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER       NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity       INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price     NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),         -- price at time of sale
  total_amount   NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  customer_name  VARCHAR(120),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales (product_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales (created_at DESC);
