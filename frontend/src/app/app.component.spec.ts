import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('displays the updated application name', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const subtitle = fixture.nativeElement.querySelector('.brand-text small');

    expect(subtitle.textContent.trim()).toBe('Inventory Management System');
  });
});
