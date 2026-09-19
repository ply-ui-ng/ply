import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';

/**
 * Library defaults for sprite paths and icon size.
 * Per-instance `<ply-icon [path]>` / `[filledPath]` / `[size]` still win.
 */
export interface BaseUiConfig {
  /** Outline SVG sprite used by `<ply-icon>`. */
  iconPath: string;
  /** Solid sprite used when `<ply-icon [filled]="true">`. */
  filledIconPath: string;
  /**
   * Default `<ply-icon>` size when `[size]` is omitted and the host has no
   * `w-*` / `h-*` class. Empty keeps the built-in `w-6 h-6` classes.
   */
  defaultSize: string | number;
}

/** Defaults used when `provideBaseUI()` is omitted. */
export const DEFAULT_BASE_UI_CONFIG: BaseUiConfig = {
  iconPath: 'assets/icons.svg',
  filledIconPath: 'assets/icons-filled.svg',
  defaultSize: '',
};

export const BASE_UI_CONFIG = new InjectionToken<BaseUiConfig>('BASE_UI_CONFIG', {
  factory: () => DEFAULT_BASE_UI_CONFIG,
});

/**
 * Override icon sprite paths and default size once in `app.config.ts`.
 *
 * @example
 * provideBaseUI({ iconPath: 'assets/icons.svg', defaultSize: 20 })
 */
export function provideBaseUI(overrides: Partial<BaseUiConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: BASE_UI_CONFIG, useValue: { ...DEFAULT_BASE_UI_CONFIG, ...overrides } },
  ]);
}

/** Inject the active library defaults. */
export function injectBaseUiConfig(): BaseUiConfig {
  return inject(BASE_UI_CONFIG);
}
