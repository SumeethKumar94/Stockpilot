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

  it('renders the updated inventory management system branding in the sidebar', () => {
    const subtitle = fixture.nativeElement.querySelector('.brand-text small');

    expect(subtitle?.textContent.trim()).toBe('Inventory Management System');
    expect(subtitle?.textContent.trim()).not.toBe('Inventory Management');
  });
});
