import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { ProductsComponent } from './pages/products.component';
import { SalesComponent } from './pages/sales.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard · StockPilot' },
  { path: 'products', component: ProductsComponent, title: 'Products · StockPilot' },
  { path: 'sales', component: SalesComponent, title: 'Sales · StockPilot' },
  { path: '**', redirectTo: 'dashboard' },
];
