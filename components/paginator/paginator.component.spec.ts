import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatorComponent } from './paginator.component';
import { provideBaseUiI18n } from '../i18n/i18n';

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('uses i18n for previous/next aria-labels', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PaginatorComponent],
      providers: [provideBaseUiI18n({ previousPage: 'Page précédente', nextPage: 'Page suivante' })],
    });
    const i18nFixture = TestBed.createComponent(PaginatorComponent);
    i18nFixture.detectChanges();
    const labels = [...i18nFixture.nativeElement.querySelectorAll('button[aria-label]')].map(
      (b: HTMLButtonElement) => b.getAttribute('aria-label'),
    );
    expect(labels).toContain('Page précédente');
    expect(labels).toContain('Page suivante');
    i18nFixture.destroy();
  });
});
