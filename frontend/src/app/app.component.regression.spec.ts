import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent branding', () => {
  const oldBranding = ['Inventory', 'Management'].join(' ');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('renders the updated application branding in the sidebar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const brand = fixture.nativeElement.querySelector('.brand-text') as HTMLElement;
    const subtitle = brand.querySelector('small') as HTMLElement;
    expect((brand.querySelector('strong') as HTMLElement).textContent.trim()).toBe('StockPilot');
    expect(subtitle.textContent.trim()).toBe('Inventory Management System');
    expect(subtitle.textContent.trim()).not.toBe(oldBranding);
  });

  it('uses the updated product name as the document title', () => {
    expect(document.title).toBe('StockPilot · Inventory Management System');
    expect(document.title).not.toBe(`StockPilot · ${oldBranding}`);
  });
});
