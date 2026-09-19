import { Component, OnInit, input, output, model, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { cn, FOCUS_RING_INSET } from '../tw-merge/tw-merge';

let calendarIdCounter = 0;

/** Represents an individual day cell in the calendar grid. */
export interface CalendarDate {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected?: boolean;
  isInRange?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
}

/**
 * A date picker calendar component that supports single date and date-range selection.
 * View month, day cells, and keyboard focus are signals (`viewDate`, `days`, `focusedDate`)
 * so the grid stays current under OnPush / zoneless. Arrow keys move by day/week;
 * Home/End jump to the month; Enter/Space select.
 *
 * @example
 * <ply-calendar mode="single" (dateSelected)="onDateChange($event)"></ply-calendar>
 */
@Component({
  selector: 'ply-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, IconButtonDirective],
  templateUrl: './calendar.component.html',
  host: { '[class]': 'hostClass()' }
})
export class CalendarComponent implements OnInit {
  /** Additional CSS classes to merge into the host element. */
  readonly extraClass = input('', { alias: "class" });

  /** ID for the calendar grid, used by combobox aria-controls on date pickers. */
  readonly panelId = input(`ply-calendar-grid-${++calendarIdCounter}`);
  /** Per-instance id for the month heading, referenced by the grid's aria-labelledby. */
  readonly monthLabelId = `ply-calendar-month-label-${calendarIdCounter}`;

  readonly hostClass = computed(() => {
    return cn(
      'block w-full max-w-80 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4',
      this.extraClass()
    );
  });

  /** The selection mode. 'single' allows picking one day, 'range' allows picking start and end dates. */
  readonly mode = input<'single' | 'range'>('single');

  /** The currently selected date (only used in 'single' mode). */
  readonly selectedDate = model<Date | null>(null);

  /** The start date of the selected range (only used in 'range' mode). */
  readonly rangeStart = model<Date | null>(null);

  /** The end date of the selected range (only used in 'range' mode). */
  readonly rangeEnd = model<Date | null>(null);

  /** Emits the selected Date when mode is 'single' and a day is clicked. */
  readonly dateSelected = output<Date>();

  /** Emits an object containing start and end Dates when mode is 'range' and a day is clicked. */
  readonly rangeSelected = output<{
    start: Date | null;
    end: Date | null;
}>();

  readonly viewDate = signal(new Date());
  readonly days = signal<CalendarDate[]>([]);
  readonly focusedDate = signal<Date | null>(null);
  weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  ngOnInit(): void {
    const selectedDate = this.selectedDate();
    const rangeStart = this.rangeStart();
    if (selectedDate) {
      this.viewDate.set(new Date(selectedDate));
    } else if (rangeStart) {
      this.viewDate.set(new Date(rangeStart));
    }
    this.generateCalendar();
  }

  private initialViewDateSet = false;

  generateCalendar(): void {
    if (!this.initialViewDateSet) {
      const selectedDate = this.selectedDate();
      const rangeStart = this.rangeStart();
      if (selectedDate) {
        this.viewDate.set(new Date(selectedDate));
      } else if (rangeStart) {
        this.viewDate.set(new Date(rangeStart));
      }
      this.initialViewDateSet = true;
    }

    const view = this.viewDate();
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: CalendarDate[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createCalendarDate(d, false));
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(this.createCalendarDate(d, true));
    }

    const totalCells = 42;
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createCalendarDate(d, false));
    }

    this.days.set(days);
    if (!this.focusedDate()) {
      const selected = this.selectedDate() ?? this.rangeStart();
      this.focusedDate.set(selected ? new Date(selected) : new Date(year, month, 1));
    }
  }

  private createCalendarDate(date: Date, isCurrentMonth: boolean): CalendarDate {
    const today = new Date();
    const isToday = this.isSameDate(date, today);

    let isSelected = false;
    let isInRange = false;
    let isRangeStart = false;
    let isRangeEnd = false;

    const selectedDate = this.selectedDate();
    const mode = this.mode();
    if (mode === 'single' && selectedDate) {
      isSelected = this.isSameDate(date, selectedDate);
    } else if (mode === 'range') {
      const rangeStart = this.rangeStart();
      if (rangeStart) isRangeStart = this.isSameDate(date, rangeStart);
      const rangeEnd = this.rangeEnd();
      if (rangeEnd) isRangeEnd = this.isSameDate(date, rangeEnd);
      if (rangeStart && rangeEnd) {
        isInRange = date > rangeStart && date < rangeEnd;
      }
    }

    return { date, isToday, isCurrentMonth, isSelected, isInRange, isRangeStart, isRangeEnd };
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  getCellClasses(calDate: CalendarDate): string {
    const inRange =
      calDate.isInRange || calDate.isRangeStart || calDate.isRangeEnd;

    return cn(
      'h-10 flex items-center justify-center cursor-pointer relative group rounded-lg',
      FOCUS_RING_INSET,
      {
        'text-slate-900 dark:text-slate-200': calDate.isCurrentMonth,
        'text-slate-300 dark:text-slate-600': !calDate.isCurrentMonth,
        'bg-blue-50 dark:bg-blue-900/40': inRange,
      }
    );
  }

  getDayClasses(calDate: CalendarDate): string {
    const inRangeSelection =
      calDate.isInRange || calDate.isRangeStart || calDate.isRangeEnd;
    const isSingleDayRange = calDate.isRangeStart && calDate.isRangeEnd;
    const isRangeEndpoint =
      this.mode() === 'range' &&
      (calDate.isRangeStart || calDate.isRangeEnd) &&
      !isSingleDayRange;

    return cn(
      'w-8 h-8 flex items-center justify-center text-xs transition-colors duration-200 z-10',
      {
        'rounded-full bg-blue-600 text-white font-bold':
          calDate.isSelected || isSingleDayRange,
        'rounded-l-full rounded-r-0 bg-blue-600 text-white font-bold':
          isRangeEndpoint && calDate.isRangeStart,
        'rounded-l-0 rounded-r-full bg-blue-600 text-white font-bold':
          isRangeEndpoint && calDate.isRangeEnd,
        'rounded-full border border-blue-500 text-blue-600 font-bold':
          calDate.isToday &&
          !calDate.isSelected &&
          !calDate.isRangeStart &&
          !calDate.isRangeEnd,
        'rounded-full hover:bg-slate-100 dark:hover:bg-slate-800':
          calDate.isCurrentMonth &&
          !calDate.isSelected &&
          !inRangeSelection,
      }
    );
  }

  prevMonth(): void {
    const view = this.viewDate();
    this.viewDate.set(new Date(view.getFullYear(), view.getMonth() - 1, 1));
    this.generateCalendar();
  }

  nextMonth(): void {
    const view = this.viewDate();
    this.viewDate.set(new Date(view.getFullYear(), view.getMonth() + 1, 1));
    this.generateCalendar();
  }

  selectDate(calDate: CalendarDate): void {
    const date = calDate.date;
    this.focusedDate.set(new Date(date));

    if (this.mode() === 'single') {
      this.selectedDate.set(date);
      this.dateSelected.emit(date);
    } else {
      const rangeStart = this.rangeStart();
      const rangeEnd = this.rangeEnd();
      if (!rangeStart || (rangeStart && rangeEnd)) {
        this.rangeStart.set(date);
        this.rangeEnd.set(null);
      } else if (rangeStart && !rangeEnd) {
        if (date < rangeStart) {
          this.rangeEnd.set(rangeStart);
          this.rangeStart.set(date);
        } else {
          this.rangeEnd.set(date);
        }
      }
      this.rangeSelected.emit({ start: this.rangeStart(), end: this.rangeEnd() });
    }
    this.generateCalendar();
  }

  isFocused(calDate: CalendarDate): boolean {
    const focused = this.focusedDate();
    return focused ? this.isSameDate(calDate.date, focused) : false;
  }

  dayTabIndex(calDate: CalendarDate): number {
    return this.isFocused(calDate) ? 0 : -1;
  }

  dayAriaLabel(calDate: CalendarDate): string {
    return calDate.date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  onGridKeydown(event: KeyboardEvent): void {
    const focused = this.focusedDate();
    if (!focused) return;
    const delta: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in delta) {
      event.preventDefault();
      const next = new Date(focused);
      next.setDate(next.getDate() + delta[event.key]);
      this.focusedDate.set(next);
      const view = this.viewDate();
      if (next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear()) {
        this.viewDate.set(new Date(next.getFullYear(), next.getMonth(), 1));
        this.generateCalendar();
      }
      return;
    }

    const view = this.viewDate();
    if (event.key === 'Home') {
      event.preventDefault();
      this.focusedDate.set(new Date(view.getFullYear(), view.getMonth(), 1));
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.focusedDate.set(new Date(view.getFullYear(), view.getMonth() + 1, 0));
      return;
    }

    if (event.key === 'PageUp') {
      event.preventDefault();
      this.prevMonth();
      return;
    }

    if (event.key === 'PageDown') {
      event.preventDefault();
      this.nextMonth();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const match = this.days().find((d) => this.isSameDate(d.date, this.focusedDate()!));
      if (match) this.selectDate(match);
    }
  }
}

/** Focus the roving day cell (or the grid) inside an attached calendar overlay. */
export function focusCalendarGrid(host: ParentNode): void {
  const cell = host.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]');
  (cell ?? host.querySelector<HTMLElement>('[role="grid"]'))?.focus();
}
