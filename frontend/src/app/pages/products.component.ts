import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CURRENCY_CODE, Product } from '../models';
import { ApiService, errorMessage } from '../services/api.service';
import { ToastService } from '../services/toast.service';

const LOW_STOCK = 10;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <header class="page-header">
      <div>
        <h1>Products</h1>
        <p class="subtitle">Add products to your inventory and keep stock levels up to date.</p>
      </div>
      <button type="button" class="btn primary" (click)="openCreate()">+ Add product</button>
    </header>

    <div class="card">
      <div class="toolbar">
        <input
          class="search"
          type="search"
          placeholder="Search by name, SKU or category…"
          [(ngModel)]="search"
          (ngModelChange)="onSearch()"
        />
        <span class="muted">{{ products().length }} product(s)</span>
      </div>

      @if (error()) {
        <div class="alert error">{{ error() }}</div>
      }

      @if (loading()) {
        <div class="empty">Loading…</div>
      } @else if (products().length === 0) {
        <div class="empty">
          <p>📦 No products found.</p>
          <button type="button" class="btn primary" (click)="openCreate()">Add your first product</button>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th class="num">Price</th>
                <th class="num">In stock</th>
                <th class="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of products(); track p.id) {
                <tr>
                  <td>
                    <strong>{{ p.name }}</strong>
                    <small class="block">{{ p.sku }}</small>
                  </td>
                  <td><span class="chip">{{ p.category }}</span></td>
                  <td class="num">{{ p.price | currency: currencyCode }}</td>
                  <td class="num">
                    <span class="badge" [class.danger]="p.quantity === 0" [class.warning]="p.quantity > 0 && p.quantity <= lowStock" [class.success]="p.quantity > lowStock">
                      {{ p.quantity === 0 ? 'Out of stock' : p.quantity }}
                    </span>
                  </td>
                  <td class="actions-col">
                    <button type="button" class="btn small" (click)="openRestock(p)">+ Stock</button>
                    <button type="button" class="btn small ghost" (click)="openEdit(p)">Edit</button>
                    <button type="button" class="btn small danger-ghost" (click)="remove(p)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (formOpen()) {
      <div class="modal-backdrop" (click)="closeModals()">
        <form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="save()" #f="ngForm">
          <h2>{{ form.id ? 'Edit product' : 'Add product' }}</h2>
          <div class="grid-2">
            <label class="field">
              <span>SKU *</span>
              <input name="sku" [(ngModel)]="form.sku" required maxlength="50" placeholder="e.g. LAP-001" />
            </label>
            <label class="field">
              <span>Category</span>
              <input name="category" [(ngModel)]="form.category" maxlength="80" placeholder="e.g. Electronics" />
            </label>
          </div>
          <label class="field">
            <span>Product name *</span>
            <input name="name" [(ngModel)]="form.name" required maxlength="150" placeholder="e.g. UltraBook 14 Laptop" />
          </label>
          <div class="grid-2">
            <label class="field">
              <span>Price *</span>
              <input name="price" type="number" min="0" step="0.01" [(ngModel)]="form.price" required />
            </label>
            <label class="field">
              <span>{{ form.id ? 'Stock quantity' : 'Initial quantity' }}</span>
              <input name="quantity" type="number" min="0" step="1" [(ngModel)]="form.quantity" required />
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="closeModals()">Cancel</button>
            <button type="submit" class="btn primary" [disabled]="f.invalid || saving()">
              {{ saving() ? 'Saving…' : form.id ? 'Save changes' : 'Add product' }}
            </button>
          </div>
        </form>
      </div>
    }

    @if (restockTarget(); as target) {
      <div class="modal-backdrop" (click)="closeModals()">
        <form class="modal narrow" (click)="$event.stopPropagation()" (ngSubmit)="restock()" #r="ngForm">
          <h2>Add stock</h2>
          <p class="muted">{{ target.name }} · currently {{ target.quantity }} in stock</p>
          <label class="field">
            <span>Quantity to add</span>
            <input name="restockQty" type="number" min="1" step="1" [(ngModel)]="restockQty" required />
          </label>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="closeModals()">Cancel</button>
            <button type="submit" class="btn primary" [disabled]="r.invalid || !restockQty || restockQty < 1 || saving()">Add stock</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class ProductsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  readonly currencyCode = CURRENCY_CODE;
  readonly lowStock = LOW_STOCK;

  products = signal<Product[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  formOpen = signal(false);
  restockTarget = signal<Product | null>(null);

  search = '';
  restockQty: number | null = 1;
  form = this.emptyForm();
  private searchTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getProducts(this.search).subscribe({
      next: (list) => {
        this.products.set(list);
        this.error.set('');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 250);
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.formOpen.set(true);
  }

  openEdit(p: Product): void {
    this.form = { id: p.id, sku: p.sku, name: p.name, category: p.category, price: p.price, quantity: p.quantity };
    this.formOpen.set(true);
  }

  openRestock(p: Product): void {
    this.restockQty = 1;
    this.restockTarget.set(p);
  }

  closeModals(): void {
    this.formOpen.set(false);
    this.restockTarget.set(null);
  }

  save(): void {
    const { id, ...input } = this.form;
    const payload = { ...input, price: Number(input.price), quantity: Number(input.quantity) };
    this.saving.set(true);
    const request = id ? this.api.updateProduct(id, payload) : this.api.createProduct(payload);
    request.subscribe({
      next: (p) => {
        this.saving.set(false);
        this.closeModals();
        this.toast.success(id ? `Updated “${p.name}”` : `Added “${p.name}” to inventory`);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }

  restock(): void {
    const target = this.restockTarget();
    if (!target || !this.restockQty) return;
    this.saving.set(true);
    this.api.restockProduct(target.id, Number(this.restockQty)).subscribe({
      next: (p) => {
        this.saving.set(false);
        this.closeModals();
        this.toast.success(`${p.name} now has ${p.quantity} in stock`);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }

  remove(p: Product): void {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    this.api.deleteProduct(p.id).subscribe({
      next: () => {
        this.toast.success(`Deleted “${p.name}”`);
        this.load();
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  private emptyForm() {
    return { id: null as number | null, sku: '', name: '', category: '', price: 0 as number | null, quantity: 0 as number | null } as {
      id: number | null;
      sku: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
    };
  }
}
