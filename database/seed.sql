-- Sample products so the UI is not empty on first run.
-- Safe to run repeatedly (existing SKUs are skipped).
INSERT INTO products (sku, name, category, price, quantity) VALUES
  ('LAP-001', 'UltraBook 14" Laptop',        'Electronics', 899.00, 12),
  ('PHN-002', 'Nova X Smartphone',           'Electronics', 549.50, 25),
  ('HDP-003', 'Wireless Noise-Cancel Headphones', 'Audio',   129.99, 40),
  ('KBD-004', 'Mechanical Keyboard',         'Accessories',  79.90, 8),
  ('MOU-005', 'Ergonomic Mouse',             'Accessories',  34.50, 60),
  ('MON-006', '27" 4K Monitor',              'Electronics', 329.00, 5),
  ('CHR-007', 'Standing Desk Converter',     'Furniture',   189.00, 3),
  ('CAB-008', 'USB-C Cable 2m',              'Accessories',   9.99, 150)
ON CONFLICT (sku) DO NOTHING;
