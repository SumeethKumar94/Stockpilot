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
    const subtitle = fixture.nativeElement.querySelector('.brand-text small');

    expect(subtitle?.textContent.trim()).toBe('Inventory Management System');
    expect(subtitle?.textContent.trim()).not.toBe(['Inventory', 'Management'].join(' '));
  });

  it('preserves the StockPilot sidebar brand while updating its subtitle', () => {
    const branding = fixture.nativeElement.querySelector('.brand-text');

    expect(branding?.querySelector('strong')?.textContent.trim()).toBe('StockPilot');
    expect(branding?.querySelector('small')?.textContent.trim()).toBe('Inventory Management System');
  });
});
