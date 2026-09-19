import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieBannerComponent } from './cookie-banner.component';

describe('CookieBannerComponent', () => {
  let fixture: ComponentFixture<CookieBannerComponent>;
  let component: CookieBannerComponent;
  const key = 'ply-cookie-consent-spec';

  beforeEach(async () => {
    localStorage.removeItem(key);
    await TestBed.configureTestingModule({
      imports: [CookieBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieBannerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('storageKey', key);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(key);
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('persists accept and hides the banner', () => {
    component.reset();
    fixture.detectChanges();
    expect(component.visible()).toBe(true);
    component.accept();
    fixture.detectChanges();
    expect(component.visible()).toBe(false);
    expect(localStorage.getItem(key)).toBe('accepted');
  });
});
