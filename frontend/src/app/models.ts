/** Change this to e.g. 'INR' or 'EUR' to change how money is displayed everywhere. */
export const CURRENCY_CODE = 'USD';

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  sku: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: number;
  product_id: number;
  product_name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_name: string | null;
  created_at: string;
  remaining_stock?: number;
}

export interface SaleInput {
  product_id: number;
  quantity: number;
  customer_name?: string;
}

export interface Stats {
  total_products: number;
  units_in_stock: number;
  inventory_value: number;
  low_stock_count: number;
  low_stock_threshold: number;
  total_sales: number;
  total_revenue: number;
  revenue_today: number;
}
