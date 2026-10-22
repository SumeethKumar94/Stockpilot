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
    expect(brand.querySelectorAll('small').length).toBe(1);
    expect(subtitle.textContent.trim()).toBe('Inventory Management System');
    expect(subtitle.textContent.trim()).not.toBe(oldBranding);
  });

  it('uses the updated product name as the document title', () => {
    expect(document.title).toBe('StockPilot · Inventory Management System');
    expect(document.title).not.toBe(`StockPilot · ${oldBranding}`);
  });

  it('does not render the old standalone branding phrase', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const renderedBranding = (fixture.nativeElement.querySelector('.brand-text small') as HTMLElement)
      .textContent.trim();
    expect(renderedBranding).not.toBe(oldBranding);
    expect(renderedBranding).toBe('Inventory Management System');
  });
});
