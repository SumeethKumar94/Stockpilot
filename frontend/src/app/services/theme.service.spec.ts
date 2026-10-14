import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let theme: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    theme = TestBed.inject(ThemeService);
  });

  it('defaults to the light mode and indigo accent', () => {
    expect(theme.mode()).toBe('light');
    expect(theme.accent()).toBe('indigo');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('switches to dark mode, updates the page and persists the choice', () => {
    theme.setMode('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('sp-mode')).toBe('dark');
  });

  it('changes the accent colour', () => {
    theme.setAccent('emerald');
    expect(document.documentElement.getAttribute('data-accent')).toBe('emerald');
    expect(localStorage.getItem('sp-accent')).toBe('emerald');
  });
});
