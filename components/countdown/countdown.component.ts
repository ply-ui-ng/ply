import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

import { cn } from '../tw-merge/tw-merge';
import { injectTimers } from '../safe-timer/safe-timer';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

/**
 * A countdown timer counting down to a target date.
 *
 * The display updates once during SSR/prerender so static HTML is not stuck at
 * zeros. The 1s client ticker starts in `afterNextRender` so it survives
 * hydration on prerendered pages (where `ngOnInit` does not re-run).
 *
 * @example
 * <ply-countdown [targetDate]="launchDate" (finished)="onLaunch()"></ply-countdown>
 */
@Component({
  selector: 'ply-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './countdown.component.html',
  host: { '[class]': 'hostCls()' },
})
export class CountdownComponent {
  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-countdown class="justify-center" [targetDate]="date"></ply-countdown>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Instant the countdown ends. Accepts a `Date` or an ISO/parseable string.
   *
   * @example
   * <ply-countdown [targetDate]="'2026-12-31T23:59:59Z'"></ply-countdown>
   */
  readonly targetDate = input.required<Date | string>();

  /**
   * Whether to show the days unit.
   *
   * @example
   * <ply-countdown [targetDate]="date" [showDays]="false"></ply-countdown>
   */
  readonly showDays = input(true, { transform: booleanAttribute });

  /**
   * Label under the days value.
   *
   * @example
   * <ply-countdown [targetDate]="date" daysLabel="D"></ply-countdown>
   */
  readonly daysLabel = input('Days');

  /**
   * Label under the hours value.
   *
   * @example
   * <ply-countdown [targetDate]="date" hoursLabel="H"></ply-countdown>
   */
  readonly hoursLabel = input('Hours');

  /**
   * Label under the minutes value.
   *
   * @example
   * <ply-countdown [targetDate]="date" minutesLabel="M"></ply-countdown>
   */
  readonly minutesLabel = input('Min');

  /**
   * Label under the seconds value.
   *
   * @example
   * <ply-countdown [targetDate]="date" secondsLabel="S"></ply-countdown>
   */
  readonly secondsLabel = input('Sec');

  /**
   * Emits on every tick with the remaining time breakdown.
   *
   * @example
   * <ply-countdown [targetDate]="date" (tick)="onTick($event)"></ply-countdown>
   */
  readonly tick = output<CountdownTime>();

  /**
   * Emits once when the countdown reaches zero.
   *
   * @example
   * <ply-countdown [targetDate]="date" (finished)="onLaunch()"></ply-countdown>
   */
  readonly finished = output<void>();

  protected readonly hostCls = computed(() => cn('flex gap-2', this.extraClass()));

  readonly time = signal<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  readonly done = signal(false);

  private readonly timers = injectTimers();
  private intervalId?: ReturnType<typeof setInterval>;

  /**
   * Flips true after the first browser render. Intervals must not start during
   * SSR/prerender — and `ngOnInit` does not re-run after hydration, so the
   * ticker is gated on this signal instead.
   */
  private readonly clientReady = signal(false);

  constructor() {
    afterNextRender(() => this.clientReady.set(true));

    // Keep the display in sync whenever the target changes (SSR-safe one-shot).
    effect(() => {
      this.targetDate();
      untracked(() => {
        this.done.set(false);
        this.update();
      });
    });

    // Client ticker — starts after hydration; restarts when the target changes.
    effect((onCleanup) => {
      if (!this.clientReady()) return;
      this.targetDate();
      // Sync effect already ran; skip the ticker if the countdown is already over.
      if (untracked(() => this.done())) return;

      this.timers.clear(this.intervalId);
      this.intervalId = this.timers.setInterval(() => this.update(), 1000);
      onCleanup(() => this.timers.clear(this.intervalId));
    });
  }

  private update() {
    const total = Math.max(0, new Date(this.targetDate()).getTime() - Date.now());
    const newTime: CountdownTime = {
      days: Math.floor(total / 86_400_000),
      hours: Math.floor((total / 3_600_000) % 24),
      minutes: Math.floor((total / 60_000) % 60),
      seconds: Math.floor((total / 1_000) % 60),
      total,
    };
    this.time.set(newTime);
    this.tick.emit(newTime);
    // `done` must not be an effect dependency — reading it here would re-enter
    // the effect when we flip the latch and hang change detection.
    if (total === 0 && !untracked(() => this.done())) {
      this.done.set(true);
      this.finished.emit();
      this.timers.clear(this.intervalId);
      this.intervalId = undefined;
    }
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
