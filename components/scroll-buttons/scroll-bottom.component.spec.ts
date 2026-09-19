import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollBottomComponent } from './scroll-bottom.component';

describe('ScrollBottomComponent', () => {
  let component: ScrollBottomComponent;
  let fixture: ComponentFixture<ScrollBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollBottomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollBottomComponent);
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
