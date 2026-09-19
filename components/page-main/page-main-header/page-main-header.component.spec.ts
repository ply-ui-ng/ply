import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMainHeaderComponent } from './page-main-header.component';

describe('PageMainHeaderComponent', () => {
  let component: PageMainHeaderComponent;
  let fixture: ComponentFixture<PageMainHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMainHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMainHeaderComponent);
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
