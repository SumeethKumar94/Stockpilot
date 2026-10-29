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

  function renderComponent(): HTMLElement {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('should display "Inventory Management System" as the application name', () => {
    const element = renderComponent();

    expect(element.textContent).toContain('Inventory Management System');
  });

  it('should not display the obsolete application name', () => {
    const element = renderComponent();
    const displayedLabels = Array.from(element.querySelectorAll('small, title, h1, h2, h3'))
      .map((label) => label.textContent?.trim());

    expect(displayedLabels).not.toContain('Inventory Management');
    expect(displayedLabels).toContain('Inventory Management System');
  });
});
