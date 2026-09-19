import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { cn } from '../tw-merge/tw-merge';

/**
 * Animates a number from a start value to the target on first viewport intersection.
 *
 * @example
 * <ply-animated-counter [value]="48295" prefix="$" separator=","></ply-animated-counter>
 */
@Component({
  selector: 'ply-animated-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './animated-counter.component.html',
  host: { '[class]': 'hostCls()' }
})
export class AnimatedCounterComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly extraClass  = input('', { alias: 'class' });
  readonly value       = input(0);
  readonly from        = input(0);
  readonly duration    = input(1500);
  readonly decimals    = input(0);
  readonly prefix      = input('');
  readonly suffix      = input('');
  readonly separator   = input(',');

  protected readonly hostCls = computed(() => cn('inline-block', this.extraClass()));

  readonly displayed = signal('0');

  private observer?: IntersectionObserver;
  private rafId?: number;
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private el   = inject(ElementRef);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.displayed.set(this.format(this.value()));
      return;
    }
    this.observe();
  }

  ngOnChanges() { this.displayed.set(this.format(this.from())); }

  private observe() {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.observer?.disconnect();
          this.zone.runOutsideAngular(() => this.animate());
        }
      },
      { threshold: 0.2 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  private animate() {
    const start = performance.now();
    const from = this.from();
    const to   = this.value();
    const dur  = this.duration();
    const step = (now: number) => {
      const progress = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.zone.run(() => this.displayed.set(this.format(from + (to - from) * eased)));
      if (progress < 1) this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  format(n: number): string {
    const fixed = n.toFixed(this.decimals());
    const [int, dec] = fixed.split('.');
    const sep = this.separator();
    const withSep = sep ? int.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : int;
    return `${this.prefix()}${dec !== undefined ? `${withSep}.${dec}` : withSep}${this.suffix()}`;
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.rafId && isPlatformBrowser(this.platformId)) cancelAnimationFrame(this.rafId);
  }
}
