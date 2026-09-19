import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageMainComponent } from './page-main.component';

describe('PageMainComponent', () => {
  let component: PageMainComponent;
  let fixture: ComponentFixture<PageMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMainComponent);
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
