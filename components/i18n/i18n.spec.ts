import { TestBed } from '@angular/core/testing';
import { BASE_UI_I18N, DEFAULT_BASE_UI_I18N, provideBaseUiI18n } from './i18n';

describe('provideBaseUiI18n', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('defaults to English chrome strings', () => {
    TestBed.configureTestingModule({});
    const i18n = TestBed.inject(BASE_UI_I18N);
    expect(i18n.close).toBe('Close');
    expect(i18n.noDataAvailable).toBe(DEFAULT_BASE_UI_I18N.noDataAvailable);
    expect(i18n.closeAlert).toBe('Close alert');
    expect(i18n.commandPalette).toBe('Command palette');
    expect(i18n.chooseTimes).toBe('Choose times');
    expect(i18n.apply).toBe('Apply');
    expect(i18n.openTimePicker('Due')).toBe('Open time picker for Due');
    expect(i18n.filesSelected(2)).toBe('2 file(s) selected');
  });

  it('merges overrides on top of English defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideBaseUiI18n({ close: 'Fermer', noResults: 'Aucun résultat' })],
    });
    const i18n = TestBed.inject(BASE_UI_I18N);
    expect(i18n.close).toBe('Fermer');
    expect(i18n.nextPage).toBe('Next page');
    expect(i18n.noResults).toBe('Aucun résultat');
    expect(i18n.selectRow(3)).toBe('Select row 3');
    expect(i18n.closeDrawer).toBe('Close drawer');
    expect(i18n.previousMonth).toBe('Previous month');
  });
});
