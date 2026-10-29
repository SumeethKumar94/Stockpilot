import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent branding', () => {
  it('renders the updated sidebar branding', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).createComponent(AppComponent);

    fixture.detectChanges();

    const brand = fixture.nativeElement.querySelector('.brand-text') as HTMLElement;
    expect(brand.textContent).toContain('StockPilot');
    expect(brand.querySelector('small')?.textContent?.trim()).toBe('Inventory Management System');
  });
});
