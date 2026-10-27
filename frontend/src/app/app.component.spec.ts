import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should render the updated sidebar branding', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.brand-text small').textContent.trim()
    ).toBe('Inventory Management System');
  });
});
