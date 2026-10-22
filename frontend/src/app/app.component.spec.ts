import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { ThemeService } from './services/theme.service';
import { ToastService } from './services/toast.service';

describe('AppComponent', () => {
  beforeEach(() => {
    const theme = {
      mode: signal<'light' | 'dark'>('light'),
      accent: signal<'indigo'>('indigo'),
      accents: [{ id: 'indigo', label: 'Indigo', color: '#6366f1' }],
      setMode: jasmine.createSpy('setMode'),
      setAccent: jasmine.createSpy('setAccent'),
    };
    const toast = {
      toasts: signal([]),
      dismiss: jasmine.createSpy('dismiss'),
    };

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: theme },
        { provide: ToastService, useValue: toast },
      ],
    });
  });

  it('renders the updated application branding in the sidebar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const brand = fixture.nativeElement.querySelector('.brand-text');
    expect(brand.querySelector('strong').textContent.trim()).toBe('StockPilot');
    expect(brand.querySelector('small').textContent.trim()).toBe('Inventory Management System');
    expect(brand.querySelector('small').textContent.trim()).not.toBe('Inventory Management');
  });
});
