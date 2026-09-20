import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RangeSliderComponent } from './range-slider.component';

describe('RangeSliderComponent', () => {
  let component: RangeSliderComponent;
  let fixture: ComponentFixture<RangeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeSliderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RangeSliderComponent);
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

  it('writes a form value onto the native range input', () => {
    component.writeValue(40);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    expect(component.value()).toBe(40);
    expect(input.getAttribute('aria-valuenow')).toBe('40');
  });

  it('updates value from the native range input', () => {
    const input = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    input.value = '25';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value()).toBe(25);
  });
});
