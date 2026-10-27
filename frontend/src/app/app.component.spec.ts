import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent branding', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('renders the updated application branding in the sidebar', () => {
    const brand = fixture.nativeElement.querySelector('.brand-text') as HTMLElement;

    expect(brand.querySelector('strong')?.textContent?.trim()).toBe('StockPilot');
    expect(brand.querySelector('small')?.textContent?.trim()).toBe('Inventory Management System');
    expect(brand.querySelector('small')?.textContent?.trim()).not.toBe('Inventory Management');
  });
});
