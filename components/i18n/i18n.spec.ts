import { TestBed } from '@angular/core/testing';
import { BASE_UI_I18N, DEFAULT_BASE_UI_I18N, provideBaseUiI18n } from './i18n';

describe('provideBaseUiI18n', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('defaults to English chrome strings', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(BASE_UI_I18N).close).toBe('Close');
    expect(TestBed.inject(BASE_UI_I18N).noDataAvailable).toBe(DEFAULT_BASE_UI_I18N.noDataAvailable);
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
  });
});
