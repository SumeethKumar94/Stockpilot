import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductInput, Sale, SaleInput, Stats } from '../models';

const BASE = '/api';

/** Pulls the friendly message out of an API error response. */
export function errorMessage(err: any): string {
  return err?.error?.error ?? 'Something went wrong. Is the API server running?';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getProducts(search = ''): Observable<Product[]> {
    let params = new HttpParams();
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<Product[]>(`${BASE}/products`, { params });
  }

  createProduct(input: ProductInput): Observable<Product> {
    return this.http.post<Product>(`${BASE}/products`, input);
  }

  updateProduct(id: number, input: ProductInput): Observable<Product> {
    return this.http.put<Product>(`${BASE}/products/${id}`, input);
  }

  restockProduct(id: number, quantity: number): Observable<Product> {
    return this.http.post<Product>(`${BASE}/products/${id}/restock`, { quantity });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/products/${id}`);
  }

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${BASE}/sales`);
  }

  createSale(input: SaleInput): Observable<Sale> {
    return this.http.post<Sale>(`${BASE}/sales`, input);
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${BASE}/stats`);
  }
}
