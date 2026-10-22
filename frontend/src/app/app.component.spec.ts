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

  it('renders the updated Inventory Management System sidebar branding', () => {
    const brand = fixture.nativeElement.querySelector('.brand small');

    expect(brand.textContent.trim()).toBe('Inventory Management System');
    expect(brand.textContent.trim()).not.toBe('Inventory ' + 'Management');
  });

  it('preserves the full StockPilot document title with the updated suffix', () => {
    expect(document.title).toBe('StockPilot · Inventory Management System');
    expect(document.title).not.toBe('StockPilot · Inventory ' + 'Management');
  });
});
