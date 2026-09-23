import {
  DestroyRef,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  ChangeDetectionStrategy,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectElementDirection } from '../direction/inject-direction';
import { TimePickerHourCycle } from '../types';
import { cn } from '../tw-merge/tw-merge';
import { IconComponent } from '../icon/icon.component';
import { BaseAddonEndDirective } from '../input-group/ply-addon-end.directive';
import { BaseInputDirective } from '../input-group/ply-input.directive';
import { InputGroupComponent } from '../input-group/input-group.component';
import { LabelComponent } from '../input-group/label/label.component';
import { ButtonGroupComponent } from '../button-group/button-group.component';
import { GroupButtonComponent } from '../button-group/group-button/group-button.component';

let timePickerIdCounter = 0;

/** Parses `HH:mm` into 24-hour hours/minutes. */
export function parseTimeValue(value: string | null | undefined): { hours: number; minutes: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec((value ?? '').trim());
  if (!match) return { hours: 0, minutes: 0 };
  return {
    hours: Math.min(23, Math.max(0, Number(match[1]))),
    minutes: Math.min(59, Math.max(0, Number(match[2]))),
  };
}

/** Formats 24-hour hours/minutes as `HH:mm`. */
export function formatTimeValue(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Overlay time picker bound to an `HH:mm` string via Angular Forms.
 * The dropdown is a CDK overlay with a transparent backdrop; it opens below the
 * field and flips above when there is not enough space.
 *
 * @example
 * <ply-time-picker [(ngModel)]="startTime" label="Start"></ply-time-picker>
 */
@Component({
  selector: 'ply-time-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgTemplateOutlet,
    IconComponent,
    InputGroupComponent,
    LabelComponent,
    BaseInputDirective,
    BaseAddonEndDirective,
    ButtonGroupComponent,
    GroupButtonComponent,
  ],
  templateUrl: './time-picker.component.html',
  host: {
    '[class]': 'hostCls()',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimePickerComponent), multi: true },
  ],
})
export class TimePickerComponent implements ControlValueAccessor, OnDestroy {
  private readonly writingDirection = injectElementDirection();
  /** Lifecycle owner for takeUntilDestroyed — see rxjs-interop. */
  private readonly destroyRef = inject(DestroyRef);
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private static readonly PANEL_POSITIONS: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  ];

  /**
   * Additional host classes.
   * @example
   * <ply-time-picker class="w-72" [(ngModel)]="time"></ply-time-picker>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Visible label above the field.
   * @example
   * <ply-time-picker label="Meeting time"></ply-time-picker>
   */
  readonly label = input('');

  /**
   * Placeholder when no time is selected.
   * @example
   * <ply-time-picker placeholder="Pick a time"></ply-time-picker>
   */
  readonly placeholder = input('Select time');

  /**
   * 12-hour or 24-hour clock.
   * @example
   * <ply-time-picker hourCycle="12"></ply-time-picker>
   */
  readonly hourCycle = input<TimePickerHourCycle>('24');

  /**
   * Minute increment (1, 5, or 15).
   * @example
   * <ply-time-picker [minuteStep]="15"></ply-time-picker>
   */
  readonly minuteStep = input(5);

  /**
   * Inline panel instead of an overlay (used inside datepicker datetime mode).
   * @example
   * <ply-time-picker [inline]="true" [(ngModel)]="time"></ply-time-picker>
   */
  readonly inline = input(false, { transform: booleanAttribute });

  /**
   * Disables the field. Also set by Angular Forms via `setDisabledState`.
   * @example
   * <ply-time-picker disabled [(ngModel)]="time"></ply-time-picker>
   */
  readonly disabledInput = input(false, { transform: booleanAttribute, alias: 'disabled' });

  /** Emits `HH:mm` when the time changes. */
  readonly timeChange = output<string>();

  protected readonly hostCls = computed(() => cn('relative block w-full', this.extraClass()));

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.formDisabled() || this.disabledInput());

  readonly inputContainer = viewChild<ElementRef<HTMLElement>>('inputContainer');
  readonly panelTpl = viewChild<TemplateRef<unknown>>('panelTemplate');

  readonly isOpen = signal(false);
  readonly hours = signal(0);
  readonly minutes = signal(0);

  readonly listboxId = `ply-time-picker-${++timePickerIdCounter}`;

  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private overlayRef: OverlayRef | null = null;

  readonly isPm = computed(() => this.hours() >= 12);

  readonly displayHour = computed(() => {
    if (this.hourCycle() === '24') return this.hours();
    const h = this.hours() % 12;
    return h === 0 ? 12 : h;
  });

  /**
   * Clock face readout: `HH:mm` in 24h mode, `HH:mm AM` / `HH:mm PM` in 12h
   * mode so it matches {@link displayText}. Defaults to AM (hours start at 0).
   */
  readonly displayClock = computed(() => {
    const clock = `${this.pad(this.displayHour())}:${this.pad(this.minutes())}`;
    if (this.hourCycle() === '12') {
      return `${clock} ${this.isPm() ? 'PM' : 'AM'}`;
    }
    return clock;
  });

  readonly formatted = computed(() => formatTimeValue(this.hours(), this.minutes()));

  readonly displayText = computed(() => {
    if (this.hourCycle() === '24') return this.formatted();
    const suffix = this.isPm() ? 'PM' : 'AM';
    return `${String(this.displayHour()).padStart(2, '0')}:${String(this.minutes()).padStart(2, '0')} ${suffix}`;
  });

  toggle(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled() || this.inline()) return;
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.inline() || this.isOpen()) return;
    this.onTouched();
    this.attachOverlay();
    if (this.overlayRef) this.isOpen.set(true);
  }

  close(): void {
    this.detachOverlay();
    this.isOpen.set(false);
  }

  ngOnDestroy(): void {
    this.detachOverlay();
  }

  selectHour(hour: number): void {
    if (this.hourCycle() === '12') {
      const pm = this.isPm();
      let h = hour % 12;
      if (pm) h += 12;
      this.hours.set(h);
    } else {
      this.hours.set(hour);
    }
    this.emit();
  }

  selectMinute(minute: number): void {
    this.minutes.set(minute);
    this.emit();
  }

  /** Steps the hour up/down, wrapping at the cycle bounds (12h or 24h). */
  stepHour(delta: number): void {
    if (this.hourCycle() === '12') {
      const index = this.displayHour() - 1; // 1-12 → 0-11
      const next = (((index + delta) % 12) + 12) % 12 + 1;
      this.selectHour(next);
    } else {
      this.selectHour((this.hours() + delta + 24) % 24);
    }
  }

  /** Steps the minutes up/down by `minuteStep`, wrapping at 60. */
  stepMinute(delta: number): void {
    const step = Math.max(1, this.minuteStep());
    const next = (((this.minutes() + delta * step) % 60) + 60) % 60;
    this.selectMinute(next);
  }

  setPeriod(pm: boolean): void {
    const h = this.hours() % 12;
    this.hours.set(pm ? h + 12 : h);
    this.emit();
  }

  /** AM/PM group selection: 'am' | 'pm'. */
  onPeriodChange(value: unknown): void {
    this.setPeriod(value === 'pm');
  }

  writeValue(value: string | null): void {
    const parsed = parseTimeValue(value);
    this.hours.set(parsed.hours);
    this.minutes.set(parsed.minutes);
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(d: boolean): void {
    this.formDisabled.set(d);
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private emit(): void {
    const value = formatTimeValue(this.hours(), this.minutes());
    this.onChange(value);
    this.timeChange.emit(value);
  }

  private attachOverlay(): void {
    if (!this.isSsrSafeBrowser || this.overlayRef) return;
    const origin = this.inputContainer()?.nativeElement;
    const template = this.panelTpl();
    if (!origin || !template) return;

    this.overlayRef = this.overlay.create({
      direction: this.writingDirection(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'ply-time-picker-overlay',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(origin)
        .withFlexibleDimensions(false)
        .withPush(false)
        .withViewportMargin(8)
        .withPositions(TimePickerComponent.PANEL_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    this.overlayRef.attach(new TemplatePortal(template, this.viewContainerRef));
    this.overlayRef.overlayElement.style.overflow = 'visible';
    // Opening click must not hit the backdrop we just created.
    queueMicrotask(() => {
      this.overlayRef?.backdropClick().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.close());
    });
    requestAnimationFrame(() => this.overlayRef?.updatePosition());
  }

  private detachOverlay(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
