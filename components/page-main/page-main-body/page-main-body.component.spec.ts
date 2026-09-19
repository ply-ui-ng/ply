import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMainBodyComponent } from './page-main-body.component';

describe('PageMainBodyComponent', () => {
  let component: PageMainBodyComponent;
  let fixture: ComponentFixture<PageMainBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMainBodyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMainBodyComponent);
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
