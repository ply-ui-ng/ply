import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';

describe('CalendarComponent a11y', () => {
  let fixture: ComponentFixture<CalendarComponent>;
  let component: CalendarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    component.generateCalendar();
    fixture.detectChanges();
  });

  it('renders a grid with an id and labelled month heading', () => {
    const grid = fixture.nativeElement.querySelector('[role="grid"]') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.id).toBe(component.panelId());
    const heading = fixture.nativeElement.querySelector(`#${component.monthLabelId}`) as HTMLElement | null;
    expect(heading).toBeTruthy();
    expect(grid.getAttribute('aria-labelledby')).toBe(component.monthLabelId);
    expect(fixture.nativeElement.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(0);
  });

  it('moves focused date with arrow keys', () => {
    const start = component.focusedDate()!;
    component.onGridKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(component.focusedDate()!.getDate()).toBe(start.getDate() + 1);
  });

  it('jumps to month start and end with Home and End', () => {
    component.onGridKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(component.focusedDate()!.getDate()).toBe(1);

    component.onGridKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(component.focusedDate()!.getMonth()).toBe(component.viewDate().getMonth());
    expect(component.focusedDate()!.getDate()).toBeGreaterThan(27);
  });
});
