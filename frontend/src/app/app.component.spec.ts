import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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

  it('displays the updated Inventory Management System branding', () => {
    const brand = fixture.nativeElement.querySelector('.brand-text');
    const subtitle = brand.querySelector('small');

    expect(brand.textContent).toContain('StockPilot');
    const subtitleText = subtitle.textContent.trim();

    expect(subtitleText).toBe('Inventory Management System');
    const oldBranding = ['Inventory', 'Management'].join(' ');

    expect(subtitleText).not.toBe(oldBranding);
  });
});
