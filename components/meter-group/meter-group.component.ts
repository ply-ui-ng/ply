import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { MeterGroupColor, MeterGroupItem, MeterGroupSize } from '../types';
import { cn } from '../tw-merge/tw-merge';

const COLOR_CYCLE: MeterGroupColor[] = [
  'primary',
  'success',
  'warning',
  'danger',
  'accent',
];

const FILL: Record<MeterGroupColor, string> = {
  primary: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  danger: 'bg-red-500',
  accent: 'bg-purple-500',
};

const STROKE: Record<MeterGroupColor, string> = {
  primary: 'stroke-blue-500',
  success: 'stroke-green-500',
  warning: 'stroke-orange-500',
  danger: 'stroke-red-500',
  accent: 'stroke-purple-500',
};

const DOT: Record<MeterGroupColor, string> = {
  primary: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  danger: 'bg-red-500',
  accent: 'bg-purple-500',
};

interface MeterSegment extends MeterGroupItem {
  color: MeterGroupColor;
  percent: number;
  widthPercent: number;
}

/**
 * A stacked meter that visualizes multiple values as proportional segments
 * of a single bar, with an optional legend.
 *
 * @example
 * <ply-meter-group [value]="[
 *   { label: 'Apps', value: 16, color: 'primary' },
 *   { label: 'Messages', value: 8, color: 'success' },
 *   { label: 'Media', value: 24, color: 'warning' },
 * ]"></ply-meter-group>
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-meter-group',
  templateUrl: './meter-group.component.html',
  imports: [IconComponent, DecimalPipe],
  host: { '[class]': 'hostClass()' },
})
export class MeterGroupComponent {
  /**
   * Segments to render. Widths are proportional to each item's `value`
   * relative to `max` (or the sum of values when `max` is unset).
   *
   * @example
   * <ply-meter-group [value]="storage"></ply-meter-group>
   */
  readonly value = input<MeterGroupItem[]>([]);

  /**
   * Thickness of the meter bar.
   *
   * @example
   * <ply-meter-group size="lg" [value]="items"></ply-meter-group>
   */
  readonly size = input<MeterGroupSize>('md');

  /**
   * Optional total baseline. When omitted, the sum of segment values is used.
   *
   * @example
   * <ply-meter-group [max]="100" [value]="items"></ply-meter-group>
   */
  readonly max = input<number | undefined>(undefined);

  /**
   * Whether to render the legend under the bar.
   *
   * @example
   * <ply-meter-group [showLegend]="false" [value]="items"></ply-meter-group>
   */
  readonly showLegend = input(true, { transform: booleanAttribute });

  /**
   * Whether legend rows show the absolute value.
   *
   * @example
   * <ply-meter-group [showValue]="false" [value]="items"></ply-meter-group>
   */
  readonly showValue = input(true, { transform: booleanAttribute });

  /**
   * Whether legend rows show the percentage share.
   *
   * @example
   * <ply-meter-group [showPercent]="false" [value]="items"></ply-meter-group>
   */
  readonly showPercent = input(true, { transform: booleanAttribute });

  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-meter-group class="mb-6" [value]="items"></ply-meter-group>
   */
  readonly extraClass = input('', { alias: 'class' });

  protected readonly hostClass = computed(() => cn('block w-full', this.extraClass()));

  protected readonly trackClass = computed(() =>
    cn(
      'flex w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700',
      {
        'h-1': this.size() === 'sm',
        'h-2': this.size() === 'md',
        'h-3': this.size() === 'lg',
        'h-4': this.size() === 'xl',
      }
    )
  );

  protected readonly used = computed(() =>
    this.value().reduce((acc, item) => acc + Math.max(0, item.value || 0), 0)
  );

  protected readonly total = computed(() => {
    const sum = this.used();
    const max = this.max();
    if (max != null && max > 0) {
      return Math.max(max, sum);
    }
    return sum;
  });

  protected readonly segments = computed<MeterSegment[]>(() => {
    const total = this.total();
    return this.value().map((item, index) => {
      const color = item.color ?? COLOR_CYCLE[index % COLOR_CYCLE.length];
      const raw = Math.max(0, item.value || 0);
      const percent = total > 0 ? (raw / total) * 100 : 0;
      return {
        ...item,
        color,
        percent,
        widthPercent: percent,
      };
    });
  });

  protected fillClass(color: MeterGroupColor): string {
    return FILL[color];
  }

  protected strokeClass(color: MeterGroupColor): string {
    return STROKE[color];
  }

  protected dotClass(color: MeterGroupColor): string {
    return DOT[color];
  }
}
