import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DualRangeSliderComponent } from './dual-range-slider.component';

describe('DualRangeSliderComponent', () => {
  let component: DualRangeSliderComponent;
  let fixture: ComponentFixture<DualRangeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DualRangeSliderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DualRangeSliderComponent);
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
