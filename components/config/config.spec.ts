import { TestBed } from '@angular/core/testing';
import { BASE_UI_CONFIG, DEFAULT_BASE_UI_CONFIG, provideBaseUI } from './config';

describe('provideBaseUI', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('defaults to the bundled sprite paths', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(BASE_UI_CONFIG)).toEqual(DEFAULT_BASE_UI_CONFIG);
  });

  it('merges overrides on top of the defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideBaseUI({ iconPath: 'cdn/icons.svg', defaultSize: 20 })],
    });
    const config = TestBed.inject(BASE_UI_CONFIG);
    expect(config.iconPath).toBe('cdn/icons.svg');
    expect(config.filledIconPath).toBe('assets/icons-filled.svg');
    expect(config.defaultSize).toBe(20);
  });
});
