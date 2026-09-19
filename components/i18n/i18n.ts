import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';

/**
 * Chrome strings for Ply primitives (empty states, paginator, dialog close).
 * Not a general translation catalog — layout marketing copy stays in templates.
 */
export interface BaseUiI18n {
  close: string;
  dialog: string;
  cancel: string;
  confirm: string;
  showPassword: string;
  hidePassword: string;
  previous: string;
  next: string;
  previousPage: string;
  nextPage: string;
  goToPage: string;
  pageNavigation: string;
  pagination: string;
  noDataAvailable: string;
  noResults: string;
  noOptionsAvailable: string;
  noOptionsFound: string;
  searching: string;
  selectAllRowsOnThisPage: string;
  openOptions: string;
  closeOptions: string;
  selection: string;
  selectRow: (id: unknown) => string;
  clear: (what: string) => string;
  remove: (label: string) => string;
  createQuoted: (query: string) => string;
  noResultsFor: (query: string) => string;
  rangeOf: (start: number, end: number, total: number) => string;
  pageOf: (current: number, total: number) => string;
}

/** English defaults used when `provideBaseUiI18n()` is omitted. */
export const DEFAULT_BASE_UI_I18N: BaseUiI18n = {
  close: 'Close',
  dialog: 'Dialog',
  cancel: 'Cancel',
  confirm: 'Confirm',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  previous: 'Previous',
  next: 'Next',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  goToPage: 'Go to page',
  pageNavigation: 'Page navigation',
  pagination: 'Pagination',
  noDataAvailable: 'No data available',
  noResults: 'No results',
  noOptionsAvailable: 'No options available',
  noOptionsFound: 'No options found',
  searching: 'Searching…',
  selectAllRowsOnThisPage: 'Select all rows on this page',
  openOptions: 'Open options',
  closeOptions: 'Close options',
  selection: 'selection',
  selectRow: (id) => `Select row ${id}`,
  clear: (what) => `Clear ${what}`,
  remove: (label) => `Remove ${label}`,
  createQuoted: (query) => `Create “${query}”`,
  noResultsFor: (query) => `No results for "${query}"`,
  rangeOf: (start, end, total) => `${start}–${end} of ${total}`,
  pageOf: (current, total) => `${current} of ${total}`,
};

export const BASE_UI_I18N = new InjectionToken<BaseUiI18n>('BASE_UI_I18N', {
  factory: () => DEFAULT_BASE_UI_I18N,
});

/**
 * Override chrome strings once in `app.config.ts`. Per-instance inputs
 * (`emptyMessage`, `emptyText`, `[ariaLabel]` on `ply-dialog-close`) still win.
 *
 * @example
 * provideBaseUiI18n({ close: 'Fermer', noResults: 'Aucun résultat' })
 */
export function provideBaseUiI18n(overrides: Partial<BaseUiI18n> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: BASE_UI_I18N, useValue: { ...DEFAULT_BASE_UI_I18N, ...overrides } },
  ]);
}

/** Inject the active chrome-string dictionary. */
export function injectBaseUiI18n(): BaseUiI18n {
  return inject(BASE_UI_I18N);
}
