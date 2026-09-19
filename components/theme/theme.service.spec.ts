import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle between light and dark', () => {
    const initial = service.isDarkMode();
    service.toggleTheme();
    expect(service.isDarkMode()).toBe(!initial);
    service.toggleTheme();
    expect(service.isDarkMode()).toBe(initial);
  });

  it('should persist theme preference in localStorage', () => {
    service.setTheme('light');
    expect(localStorage.getItem('theme')).toBe('light');
    service.setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should add and remove dark class on html element', () => {
    service.setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    service.setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('ThemeService SSR', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should construct and set theme without reading or writing localStorage', () => {
    localStorage.setItem('theme', 'light');

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    expect(() => TestBed.inject(ThemeService)).not.toThrow();
    const service = TestBed.inject(ThemeService);

    // Saved browser preference must not be applied on the server.
    expect(service.isDarkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    localStorage.clear();
    expect(() => service.setTheme('light')).not.toThrow();
    expect(service.isDarkMode()).toBe(false);
    expect(localStorage.getItem('theme')).toBeNull();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
