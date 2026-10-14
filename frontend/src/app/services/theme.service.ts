import { Injectable, signal } from '@angular/core';

export type Mode = 'light' | 'dark';
export type Accent = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky';

export const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: 'indigo', label: 'Indigo', color: '#6366f1' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'amber', label: 'Amber', color: '#f59e0b' },
  { id: 'sky', label: 'Sky', color: '#0ea5e9' },
];

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable - theme just won't persist */
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly accents = ACCENTS;
  readonly mode = signal<Mode>(read('sp-mode') === 'dark' ? 'dark' : 'light');
  readonly accent = signal<Accent>(
    (ACCENTS.find((a) => a.id === read('sp-accent'))?.id ?? 'indigo') as Accent
  );

  constructor() {
    this.apply();
  }

  setMode(mode: Mode): void {
    this.mode.set(mode);
    write('sp-mode', mode);
    this.apply();
  }

  setAccent(accent: Accent): void {
    this.accent.set(accent);
    write('sp-accent', accent);
    this.apply();
  }

  private apply(): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', this.mode());
    root.setAttribute('data-accent', this.accent());
  }
}
