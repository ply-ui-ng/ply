import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

/**
 * Manages the application's light/dark mode state.
 *
 * Safe under SSR: `localStorage` is only read/written in the browser.
 * The `dark` class is still applied to `<html>` during server render so
 * the initial HTML matches the default (or later hydrated) theme.
 *
 * @example
 * theme = inject(ThemeService);
 * toggleDarkMode() { this.theme.toggleTheme(); }
 * isDark = this.theme.isDarkMode;
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2;
  private readonly _currentTheme = signal<'light' | 'dark'>('dark');

  /** Signal: whether dark mode is currently active. */
  readonly isDarkMode = computed(() => this._currentTheme() === 'dark');

  constructor() {
    const rendererFactory = inject(RendererFactory2);
    this.renderer = rendererFactory.createRenderer(null, null);

    // First Angular render always uses dark so SSR HTML and hydration match.
    // The inline script in index.html already set `html.dark` for CSS; do not
    // touch the class on the client until after hydration.
    if (!isPlatformBrowser(this.platformId)) {
      this.applyTheme('dark', false);
      return;
    }

    const saved = localStorage.getItem('theme');
    const cssTheme: 'light' | 'dark' =
      saved === 'light' || saved === 'dark' ? saved : 'dark';
    // Paint the correct class immediately (CSR + the demo's inline script).
    // Keep the signal on `dark` until after hydration so templates match SSR.
    this.syncHtmlClass(cssTheme);
    afterNextRender(() => this.applyTheme(cssTheme, false));
  }

  /**
   * Toggles between light and dark mode.
   *
   * @example
   * theme.toggleTheme();
   */
  toggleTheme() {
    this.setTheme(this._currentTheme() === 'light' ? 'dark' : 'light');
  }

  /**
   * Sets the theme explicitly and persists it to `localStorage` (browser only).
   *
   * @example
   * theme.setTheme('light');
   */
  setTheme(theme: 'light' | 'dark') {
    this.applyTheme(theme, true);
  }

  private applyTheme(theme: 'light' | 'dark', persist: boolean) {
    this._currentTheme.set(theme);

    if (persist && isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
    }

    this.syncHtmlClass(theme);
  }

  private syncHtmlClass(theme: 'light' | 'dark') {
    const html = this.document.documentElement;
    if (!html) {
      return;
    }
    if (theme === 'dark') {
      this.renderer.addClass(html, 'dark');
    } else {
      this.renderer.removeClass(html, 'dark');
    }
  }
}
