import { ComponentFixture, TestBed } from '@angular/core/testing';
import { formatTimeValue, parseTimeValue, TimePickerComponent } from './time-picker.component';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('parses and formats HH:mm', () => {
    expect(parseTimeValue('09:30')).toEqual({ hours: 9, minutes: 30 });
    expect(formatTimeValue(9, 5)).toBe('09:05');
  });

  it('writes a time value', () => {
    component.writeValue('14:45');
    expect(component.hours()).toBe(14);
    expect(component.minutes()).toBe(45);
  });

  it('opens a CDK overlay with a backdrop', () => {
    component.open();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    expect(document.querySelector('.cdk-overlay-pane')).toBeTruthy();
    expect(document.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
    expect(document.getElementById(component.listboxId)).toBeTruthy();
  });

  it('steps hours and minutes with wraparound', () => {
    component.writeValue('23:55');
    component.stepHour(1);
    expect(component.hours()).toBe(0);
    component.stepMinute(1);
    expect(component.minutes()).toBe(0);
    component.stepMinute(-1);
    expect(component.minutes()).toBe(55);
  });

  it('keeps AM/PM when wrapping the 12-hour face', () => {
    fixture.componentRef.setInput('hourCycle', '12');
    fixture.detectChanges();
    component.writeValue('00:00');
    component.stepHour(-1);
    expect(component.hours()).toBe(11);
    expect(component.isPm()).toBe(false);
    component.writeValue('12:00');
    component.stepHour(1);
    expect(component.hours()).toBe(13);
    expect(component.isPm()).toBe(true);
  });
});
