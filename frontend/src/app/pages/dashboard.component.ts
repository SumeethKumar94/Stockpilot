import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CURRENCY_CODE, Product, Sale, Stats } from '../models';
import { ApiService, errorMessage } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <header class="page-header">
  <div>
    <h1>Dashboard</h1>
    <p class="subtitle">A quick overview of your stock and sales.</p>
  </div>
  <a routerLink="/sales" class="btn primary">+ New sale</a>
</header>

@if (error()) {
  <div class="alert error">{{ error() }}</div>
}

@if (loading()) {
  <div class="empty">Loading…</div>
} @else {
  @if (stats(); as s) {
    <section class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">📦</span>
        <div>
          <p>Products</p>
          <strong>{{ s.total_products }}</strong>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">🧮</span>
        <div>
          <p>Units in stock</p>
          <strong>{{ s.units_in_stock }}</strong>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">💼</span>
        <div>
          <p>Inventory value</p>
          <strong>{{ s.inventory_value | currency: currencyCode }}</strong>
        </div>
      </div>

      <div class="stat-card" [class.warn]="s.low_stock_count > 0">
        <span class="stat-icon">⚠️</span>
        <div>
          <p>Low stock (≤ {{ s.low_stock_threshold }})</p>
          <strong>{{ s.low_stock_count }}</strong>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-icon">🧾</span>
        <div>
          <p>Total sales</p>
          <strong>{{ s.total_sales }}</strong>
        </div>
      </div>

      <div class="stat-card highlight">
        <span class="stat-icon">💰</span>
        <div>
          <p>Revenue (today: {{ s.revenue_today | currency: currencyCode }})</p>
          <strong>{{ s.total_revenue | currency: currencyCode }}</strong>
        </div>
      </div>
    </section>

    <section class="two-col">
      <div class="card">
        <div class="card-head">
          <h2>Low stock alerts</h2>
          <a routerLink="/products" class="link">Manage →</a>
        </div>

        @if (lowStock().length === 0) {
          <div class="empty small">🎉 Everything is well stocked.</div>
        } @else {
          <ul class="list">
            @for (p of lowStock(); track p.id) {
              <li>
                <div>
                  <strong>{{ p.name }}</strong>
                  <small>{{ p.sku }}</small>
                </div>
                <span
                  class="badge"
                  [class.danger]="p.quantity === 0"
                  [class.warning]="p.quantity > 0"
                >
                  {{ p.quantity === 0 ? 'Out of stock' : p.quantity + ' left' }}
                </span>
              </li>
            }
          </ul>
        }
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Recent sales</h2>
          <a routerLink="/sales" class="link">View all →</a>
        </div>

        @if (recent().length === 0) {
          <div class="empty small">No sales yet. Record your first sale!</div>
        } @else {
          <ul class="list">
            @for (sale of recent(); track sale.id) {
              <li>
                <div>
                  <strong>{{ sale.product_name }} × {{ sale.quantity }}</strong>
                  <small>
                    {{ sale.created_at | date: 'MMM d, h:mm a' }}{{ sale.customer_name ? ' · ' + sale.customer_name : '' }}
                  </small>
                </div>
                <span class="amount">
                  {{ sale.total_amount | currency: currencyCode }}
                </span>
              </li>
            }
          </ul>
        }
      </div>
    </section>
  } @else {
    <div class="empty">Dashboard statistics are unavailable.</div>
  }
}
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  readonly currencyCode = CURRENCY_CODE;

  loading = signal(true);
  error = signal('');
  stats = signal<Stats | null>(null);
  lowStock = signal<Product[]>([]);
  recent = signal<Sale[]>([]);

  ngOnInit(): void {
    forkJoin({ stats: this.api.getStats(), products: this.api.getProducts(), sales: this.api.getSales() }).subscribe({
      next: ({ stats, products, sales }) => {
        this.stats.set(stats);
        this.lowStock.set(
          products.filter((p) => p.quantity <= stats.low_stock_threshold).sort((a, b) => a.quantity - b.quantity).slice(0, 6)
        );
        this.recent.set(sales.slice(0, 6));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
