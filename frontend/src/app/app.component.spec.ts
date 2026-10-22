import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AppComponent } from './app.component';
import { ACCENTS, ThemeService } from './services/theme.service';
import { Toast, ToastService } from './services/toast.service';

describe('AppComponent', () => {
  const theme = {
    mode: signal<'light' | 'dark'>('light'),
    setMode: jasmine.createSpy('setMode'),
    accents: ACCENTS,
    accent: signal<'indigo' | 'emerald' | 'rose' | 'amber' | 'sky'>('indigo'),
    setAccent: jasmine.createSpy('setAccent'),
  };
  const toast = {
    toasts: signal<Toast[]>([]),
    dismiss: jasmine.createSpy('dismiss'),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: theme },
        { provide: ToastService, useValue: toast },
      ],
    });
  });

  it('should render the updated application branding', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const branding = fixture.nativeElement.querySelector('.brand-text small');
    expect(branding.textContent.trim()).toBe('Inventory Management System');
  });

  it('should render the application shell without console errors', () => {
    const consoleError = spyOn(console, 'error');

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
