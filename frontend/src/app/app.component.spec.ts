import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ThemeService } from './services/theme.service';
import { ToastService } from './services/toast.service';

describe('AppComponent', () => {
  it('renders the updated Inventory Management System sidebar branding', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [ThemeService, ToastService, provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.brand-text small').textContent.trim()
    ).toBe('Inventory Management System');
  });
});
