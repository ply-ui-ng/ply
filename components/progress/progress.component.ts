import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { ProgressColor, ProgressSize } from '../types';
import { cn } from '../tw-merge/tw-merge';

/**
 * A linear progress bar with an optional tip tooltip that appears on hover
 * at the leading edge of the fill.
 *
 * @example
 * <ply-progress [value]="75" color="success" size="lg"></ply-progress>
 * <ply-progress [value]="40" [showTip]="false"></ply-progress>
 */
@Component({
  selector: 'ply-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.component.html',
  host: {
    '[class]': 'hostClass()',
    role: 'progressbar',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': '100',
    '[attr.aria-valuenow]': 'clamped()',
  },
})
export class ProgressComponent {
  /**
   * Current progress value from 0 to 100.
   *
   * @example
   * <ply-progress [value]="62"></ply-progress>
   */
  readonly value = input(0, { transform: numberAttribute });

  /**
   * Semantic color of the fill.
   *
   * @example
   * <ply-progress color="success" [value]="80"></ply-progress>
   */
  readonly color = input<ProgressColor>('primary');

  /**
   * Height / thickness of the bar.
   *
   * @example
   * <ply-progress size="lg" [value]="50"></ply-progress>
   */
  readonly size = input<ProgressSize>('md');

  /**
   * When true (default), hovering the bar shows the value in a tip at the fill edge.
   *
   * @example
   * <ply-progress [value]="45" [showTip]="false"></ply-progress>
   */
  readonly showTip = input(true, { transform: booleanAttribute });

  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-progress class="mb-4" [value]="30"></ply-progress>
   */
  readonly extraClass = input('', { alias: 'class' });

  readonly clamped = computed(() => {
    const n = Number(this.value()) || 0;
    return Math.min(100, Math.max(0, n));
  });

  readonly displayValue = computed(() => {
    const n = this.clamped();
    return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
  });

  protected readonly hostClass = computed(() =>
    cn('block w-full', this.showTip() && 'pt-8', this.extraClass())
  );

  protected readonly trackClass = computed(() =>
    cn('group relative w-full overflow-visible rounded-full bg-slate-200 dark:bg-slate-700', {
      'h-1': this.size() === 'sm',
      'h-2': this.size() === 'md' || this.size() === 'default',
      'h-3': this.size() === 'lg',
      'h-4': this.size() === 'xl',
    })
  );

  protected readonly fillClass = computed(() =>
    cn('relative h-full rounded-full transition-all duration-300', {
      'bg-blue-500': this.color() === 'primary',
      'bg-green-500': this.color() === 'success',
      'bg-red-500': this.color() === 'danger',
      'bg-orange-500': this.color() === 'warning',
      'bg-purple-500': this.color() === 'accent',
    })
  );

  protected readonly tipClass = computed(() =>
    cn(
      'pointer-events-none absolute top-0 z-10 flex -translate-x-1/2 -translate-y-[calc(100%+8px)] flex-col items-center',
      'opacity-0 scale-95 transition-[opacity,transform,left] duration-150 ease-out',
      'group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100'
    )
  );

  protected readonly tipBubbleClass = computed(() =>
    cn('whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold tabular-nums text-white shadow-md', {
      'bg-blue-600 dark:bg-blue-500': this.color() === 'primary',
      'bg-green-600 dark:bg-green-500': this.color() === 'success',
      'bg-red-600 dark:bg-red-500': this.color() === 'danger',
      'bg-orange-600 dark:bg-orange-500': this.color() === 'warning',
      'bg-purple-600 dark:bg-purple-500': this.color() === 'accent',
    })
  );

  protected readonly tipCaretClass = computed(() =>
    cn('h-0 w-0 border-x-[5px] border-x-transparent border-t-[6px]', {
      'border-t-blue-600 dark:border-t-blue-500': this.color() === 'primary',
      'border-t-green-600 dark:border-t-green-500': this.color() === 'success',
      'border-t-red-600 dark:border-t-red-500': this.color() === 'danger',
      'border-t-orange-600 dark:border-t-orange-500': this.color() === 'warning',
      'border-t-purple-600 dark:border-t-purple-500': this.color() === 'accent',
    })
  );
}
