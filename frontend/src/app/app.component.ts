import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-logo">S</span>
          <div class="brand-text">
            <strong>StockPilot</strong>
            <small>Inventory Management</small>
          </div>
        </div>

        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active"><span class="ico">📊</span> Dashboard</a>
          <a routerLink="/products" routerLinkActive="active"><span class="ico">📦</span> Products</a>
          <a routerLink="/sales" routerLinkActive="active"><span class="ico">🧾</span> Sales</a>
        </nav>

        <div class="theme-panel">
          <p class="panel-label">Appearance</p>
          <div class="mode-toggle">
            <button type="button" [class.active]="theme.mode() === 'light'" (click)="theme.setMode('light')">☀️ Light</button>
            <button type="button" [class.active]="theme.mode() === 'dark'" (click)="theme.setMode('dark')">🌙 Dark</button>
          </div>
          <p class="panel-label">Accent colour</p>
          <div class="swatches">
            @for (a of theme.accents; track a.id) {
              <button
                type="button"
                class="swatch"
                [style.background]="a.color"
                [class.active]="theme.accent() === a.id"
                [title]="a.label"
                [attr.aria-label]="a.label + ' accent'"
                (click)="theme.setAccent(a.id)"
              ></button>
            }
          </div>
        </div>
      </aside>

      <main class="main">
        <router-outlet />
      </main>
    </div>

    <div class="toast-stack" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.error]="t.type === 'error'" (click)="toast.dismiss(t.id)">
          <span>{{ t.type === 'error' ? '⚠️' : '✅' }}</span>
          <span>{{ t.message }}</span>
        </div>
      }
    </div>
  `,
})
export class AppComponent {
  theme = inject(ThemeService);
  toast = inject(ToastService);
}
