import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  it('displays the updated Inventory Management System subtitle in the sidebar', () => {
    const subtitle = fixture.nativeElement.querySelector('.brand-text small') as HTMLElement;

    expect(subtitle.textContent?.trim()).toBe('Inventory Management System');
    expect(subtitle.textContent?.trim()).not.toBe(['Inventory', 'Management'].join(' '));
    expect(fixture.nativeElement.querySelector('.brand-text strong').textContent.trim()).toBe('StockPilot');
  });
});
