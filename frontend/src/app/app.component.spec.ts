import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('renders the updated application branding', () => {
    const branding = fixture.nativeElement.querySelector('.brand-text small');

    const brandingText = branding.textContent.trim();

    expect(brandingText).toBe('Inventory Management System');
    expect(brandingText).not.toBe(['Inventory', 'Management'].join(' '));
  });
});
