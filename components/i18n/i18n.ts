import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';

/**
 * Chrome strings for Ply primitives (empty states, paginator, close, previous,
 * next, toolbars, and the command palette). Layout and form-block marketing
 * copy stays in templates.
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
  closeAlert: string;
  closeDrawer: string;
  closeBottomSheet: string;
  previousMonth: string;
  nextMonth: string;
  previousItems: string;
  nextItems: string;
  scrollToPreviousTabs: string;
  scrollToNextTabs: string;
  imageTools: string;
  flipHorizontal: string;
  flipVertical: string;
  rotate90Degrees: string;
  zoomOut: string;
  zoomIn: string;
  downloadImage: string;
  closeLightbox: string;
  previousImage: string;
  nextImage: string;
  exitFullscreen: string;
  enterFullscreen: string;
  imageUnavailable: string;
  formatting: string;
  undo: string;
  redo: string;
  paragraphStyle: string;
  paragraph: string;
  heading1: string;
  heading2: string;
  heading3: string;
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  bulletList: string;
  numberedList: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  justify: string;
  insertLink: string;
  clearFormatting: string;
  timePicker: string;
  hours: string;
  increaseHour: string;
  decreaseHour: string;
  minutes: string;
  increaseMinutes: string;
  decreaseMinutes: string;
  amOrPm: string;
  am: string;
  pm: string;
  openTimePicker: (forLabel?: string) => string;
  selectedTime: (time: string) => string;
  toggleNavigation: string;
  toggleSidebar: string;
  toggleLeftPanel: string;
  toggleRightPanel: string;
  chooseFilesToUpload: string;
  orClickToBrowse: string;
  showSelectedFiles: string;
  clearAllFiles: string;
  filesSelected: (count: number) => string;
  selectedFiles: (count: number) => string;
  cookieConsent: string;
  stopGenerating: string;
  sendMessage: string;
  commandPalette: string;
  searchCommands: string;
  commands: string;
  navigate: string;
  select: string;
  changeDate: string;
  changeDates: string;
  chooseTime: string;
  chooseTimes: string;
  apply: string;
  startTime: string;
  endTime: string;
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
  closeAlert: 'Close alert',
  closeDrawer: 'Close drawer',
  closeBottomSheet: 'Close bottom sheet',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousItems: 'Previous items',
  nextItems: 'Next items',
  scrollToPreviousTabs: 'Scroll to previous tabs',
  scrollToNextTabs: 'Scroll to next tabs',
  imageTools: 'Image tools',
  flipHorizontal: 'Flip horizontal',
  flipVertical: 'Flip vertical',
  rotate90Degrees: 'Rotate 90 degrees',
  zoomOut: 'Zoom out',
  zoomIn: 'Zoom in',
  downloadImage: 'Download image',
  closeLightbox: 'Close lightbox',
  previousImage: 'Previous image',
  nextImage: 'Next image',
  exitFullscreen: 'Exit fullscreen',
  enterFullscreen: 'Enter fullscreen',
  imageUnavailable: 'Image unavailable',
  formatting: 'Formatting',
  undo: 'Undo',
  redo: 'Redo',
  paragraphStyle: 'Paragraph style',
  paragraph: 'Paragraph',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  bulletList: 'Bullet list',
  numberedList: 'Numbered list',
  alignLeft: 'Align left',
  alignCenter: 'Align center',
  alignRight: 'Align right',
  justify: 'Justify',
  insertLink: 'Insert link',
  clearFormatting: 'Clear formatting',
  timePicker: 'Time picker',
  hours: 'Hours',
  increaseHour: 'Increase hour',
  decreaseHour: 'Decrease hour',
  minutes: 'Minutes',
  increaseMinutes: 'Increase minutes',
  decreaseMinutes: 'Decrease minutes',
  amOrPm: 'AM or PM',
  am: 'AM',
  pm: 'PM',
  openTimePicker: (forLabel = '') =>
    forLabel ? `Open time picker for ${forLabel}` : 'Open time picker',
  selectedTime: (time) => `Selected time ${time}`,
  toggleNavigation: 'Toggle navigation',
  toggleSidebar: 'Toggle sidebar',
  toggleLeftPanel: 'Toggle left panel',
  toggleRightPanel: 'Toggle right panel',
  chooseFilesToUpload: 'Choose files to upload',
  orClickToBrowse: 'or click to browse',
  showSelectedFiles: 'Show selected files',
  clearAllFiles: 'Clear all files',
  filesSelected: (count) => `${count} file(s) selected`,
  selectedFiles: (count) => `Selected files (${count})`,
  cookieConsent: 'Cookie consent',
  stopGenerating: 'Stop generating',
  sendMessage: 'Send message',
  commandPalette: 'Command palette',
  searchCommands: 'Search commands',
  commands: 'Commands',
  navigate: 'Navigate',
  select: 'Select',
  changeDate: 'Change date',
  changeDates: 'Change dates',
  chooseTime: 'Choose time',
  chooseTimes: 'Choose times',
  apply: 'Apply',
  startTime: 'Start',
  endTime: 'End',
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
