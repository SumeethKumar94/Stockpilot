import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CURRENCY_CODE, Product, Sale } from '../models';
import { ApiService, errorMessage } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <header class="page-header">
      <div>
        <h1>Sales</h1>
        <p class="subtitle">Record a sale — the sold quantity is deducted from inventory automatically.</p>
      </div>
    </header>

    <section class="two-col sales-layout">
      <form class="card" (ngSubmit)="submit()" #f="ngForm">
        <div class="card-head"><h2>New sale</h2></div>

        <label class="field">
          <span>Product *</span>
          <select name="product" [(ngModel)]="productId" required>
            <option [ngValue]="null" disabled>Select a product…</option>
            @for (p of available(); track p.id) {
              <option [ngValue]="p.id">{{ p.name }} ({{ p.quantity }} in stock)</option>
            }
          </select>
        </label>

        @if (available().length === 0 && !loading()) {
          <div class="alert warning">No products in stock. Add or restock products first.</div>
        }

        <label class="field">
          <span>Quantity *</span>
          <input name="quantity" type="number" min="1" step="1" [max]="selected?.quantity ?? null" [(ngModel)]="quantity" required />
        </label>

        <label class="field">
          <span>Customer name <em>(optional)</em></span>
          <input name="customer" [(ngModel)]="customer" maxlength="120" placeholder="e.g. Priya Sharma" />
        </label>

        @if (selected; as p) {
          <div class="summary">
            <div><span>Unit price</span><strong>{{ p.price | currency: currencyCode }}</strong></div>
            <div><span>Available</span><strong>{{ p.quantity }}</strong></div>
            <div class="total"><span>Total</span><strong>{{ total | currency: currencyCode }}</strong></div>
          </div>
          @if (quantity && quantity > p.quantity) {
            <div class="alert error">Only {{ p.quantity }} unit(s) available.</div>
          }
        }

        <button type="submit" class="btn primary block-btn" [disabled]="!valid || saving()">
          {{ saving() ? 'Recording…' : 'Record sale' }}
        </button>
      </form>

      <div class="card">
        <div class="card-head">
          <h2>Sales history</h2>
          <span class="muted">{{ sales().length }} record(s)</span>
        </div>

        @if (error()) {
          <div class="alert error">{{ error() }}</div>
        }

        @if (loading()) {
          <div class="empty">Loading…</div>
        } @else if (sales().length === 0) {
          <div class="empty small">🧾 No sales recorded yet.</div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th class="num">Qty</th>
                  <th class="num">Total</th>
                </tr>
              </thead>
              <tbody>
                @for (s of sales(); track s.id) {
                  <tr>
                    <td>
                      {{ s.created_at | date: 'MMM d, y' }}
                      <small class="block">{{ s.created_at | date: 'h:mm a' }}</small>
                    </td>
                    <td>
                      <strong>{{ s.product_name }}</strong>
                      <small class="block">{{ s.customer_name || 'Walk-in customer' }}</small>
                    </td>
                    <td class="num">{{ s.quantity }}</td>
                    <td class="num amount">{{ s.total_amount | currency: currencyCode }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </section>
  `,
})
export class SalesComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  readonly currencyCode = CURRENCY_CODE;

  loading = signal(true);
  saving = signal(false);
  error = signal('');
  products = signal<Product[]>([]);
  sales = signal<Sale[]>([]);

  productId: number | null = null;
  quantity: number | null = 1;
  customer = '';

  ngOnInit(): void {
    this.reload();
  }

  available(): Product[] {
    return this.products().filter((p) => p.quantity > 0);
  }

  get selected(): Product | undefined {
    return this.products().find((p) => p.id === this.productId);
  }

  get total(): number {
    return this.selected ? Math.round(this.selected.price * (this.quantity || 0) * 100) / 100 : 0;
  }

  get valid(): boolean {
    const p = this.selected;
    const q = Number(this.quantity);
    return !!p && Number.isInteger(q) && q >= 1 && q <= p.quantity;
  }

  reload(): void {
    this.api.getProducts().subscribe({
      next: (list) => this.products.set(list),
      error: (err) => this.error.set(errorMessage(err)),
    });
    this.api.getSales().subscribe({
      next: (list) => {
        this.sales.set(list);
        this.error.set('');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (!this.valid || this.productId === null) return;
    this.saving.set(true);
    this.api
      .createSale({ product_id: this.productId, quantity: Number(this.quantity), customer_name: this.customer.trim() || undefined })
      .subscribe({
        next: (sale) => {
          this.saving.set(false);
          this.toast.success(`Sold ${sale.quantity} × ${sale.product_name}. ${sale.remaining_stock} left in stock.`);
          this.productId = null;
          this.quantity = 1;
          this.customer = '';
          this.reload();
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error(errorMessage(err));
          this.reload();
        },
      });
  }
}
