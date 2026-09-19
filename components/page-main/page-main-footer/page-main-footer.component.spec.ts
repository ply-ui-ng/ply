import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMainFooterComponent } from './page-main-footer.component';

describe('PageMainFooterComponent', () => {
  let component: PageMainFooterComponent;
  let fixture: ComponentFixture<PageMainFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMainFooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMainFooterComponent);
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
});
