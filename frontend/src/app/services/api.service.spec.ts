import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService, errorMessage } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads products from /api/products', () => {
    api.getProducts().subscribe((list) => expect(list.length).toBe(1));
    const req = http.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, sku: 'A', name: 'A', category: 'x', price: 1, quantity: 1 }]);
  });

  it('sends the search term as a query parameter', () => {
    api.getProducts('  lap ').subscribe();
    const req = http.expectOne((r) => r.url === '/api/products' && r.params.get('search') === 'lap');
    req.flush([]);
  });

  it('creates a product with POST', () => {
    const input = { sku: 'S1', name: 'Thing', category: 'Misc', price: 5, quantity: 2 };
    api.createProduct(input).subscribe();
    const req = http.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({ id: 1, ...input });
  });

  it('records a sale with POST /api/sales', () => {
    api.createSale({ product_id: 3, quantity: 2 }).subscribe();
    const req = http.expectOne('/api/sales');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ product_id: 3, quantity: 2 });
    req.flush({});
  });

  it('restocks a product', () => {
    api.restockProduct(7, 15).subscribe();
    const req = http.expectOne('/api/products/7/restock');
    expect(req.request.body).toEqual({ quantity: 15 });
    req.flush({});
  });

  it('extracts API error messages', () => {
    expect(errorMessage({ error: { error: 'Insufficient stock' } })).toBe('Insufficient stock');
    expect(errorMessage({})).toContain('API server');
  });
});
