import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { cn } from '../tw-merge/tw-merge';
import { StatCardColor, StatCardVariant } from '../types';

const SPARKLINE_WIDTH = 400;
const SPARKLINE_HEIGHT = 48;

/**
 * A dashboard metric card. Classic mode shows a large value, label, optional
 * trend text, and icon. Metric mode matches Motif Admin KPI tiles: uppercase
 * label, delta pill, large value, inline sparkline, and caption — without
 * depending on Pro `ply-chart`.
 *
 * @example
 * <ply-stat-card label="Revenue" value="$48,295" trend="+12.5%" [trendUp]="true" icon="dollar-sign"></ply-stat-card>
 *
 * @example
 * <ply-stat-card
 *   variant="metric"
 *   label="Net revenue"
 *   value="$248,910"
 *   caption="vs $210K previous period"
 *   [delta]="0.062"
 *   [series]="[12, 14, 13, 18, 17, 22]"
 * ></ply-stat-card>
 */
@Component({
  selector: 'ply-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './stat-card.component.html',
  host: { '[class]': 'hostCls()' },
})
export class StatCardComponent {
  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-stat-card class="shadow-lg" label="Users" value="1,842"></ply-stat-card>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Layout mode. `classic` is the icon-left tile; `metric` is the Motif-style
   * vertical stack with delta pill and sparkline.
   *
   * @example
   * <ply-stat-card variant="metric" label="Revenue" value="$248K" [delta]="0.06" [series]="data"></ply-stat-card>
   */
  readonly variant = input<StatCardVariant>('classic');

  /**
   * The large metric value.
   *
   * @example
   * <ply-stat-card value="$48,295" label="Revenue"></ply-stat-card>
   */
  readonly value = input('');

  /**
   * Label rendered above the value (classic) or as a micro uppercase header (metric).
   *
   * @example
   * <ply-stat-card label="Active Users" value="1,842"></ply-stat-card>
   */
  readonly label = input('');

  /**
   * Preformatted trend text for classic mode (e.g. `"+12.5%"`).
   *
   * @example
   * <ply-stat-card trend="+12.5%" [trendUp]="true" value="$48K" label="Revenue"></ply-stat-card>
   */
  readonly trend = input<string | undefined>(undefined);

  /**
   * Classic mode: `true` = green up arrow, `false` = red down arrow.
   *
   * @example
   * <ply-stat-card trend="-3.1%" [trendUp]="false" value="34" label="Refunds"></ply-stat-card>
   */
  readonly trendUp = input<boolean | undefined>(undefined);

  /**
   * Optional icon name for classic mode (tinted bubble).
   *
   * @example
   * <ply-stat-card icon="dollar-sign" color="primary" value="$48K" label="Revenue"></ply-stat-card>
   */
  readonly icon = input<string | undefined>(undefined);

  /**
   * Tint for the classic icon bubble.
   *
   * @example
   * <ply-stat-card color="success" icon="users" value="1,842" label="Users"></ply-stat-card>
   */
  readonly color = input<StatCardColor>('primary');

  /**
   * Comparison caption. Classic: shown beside the trend when `trend` is set.
   * Metric: always shown under the sparkline when non-empty.
   *
   * @example
   * <ply-stat-card caption="vs last month" trend="+12%" [trendUp]="true" value="$48K" label="Revenue"></ply-stat-card>
   */
  readonly caption = input<string | undefined>(undefined);

  /**
   * Metric mode: period-over-period change as a ratio (`0.062` → `+6.2%`).
   * Drives the delta pill and sparkline stroke color.
   *
   * @example
   * <ply-stat-card variant="metric" [delta]="0.062" label="Revenue" value="$248K"></ply-stat-card>
   */
  readonly delta = input<number | undefined>(undefined);

  /**
   * Metric mode: sparkline series. Empty/omitted hides the chart.
   *
   * @example
   * <ply-stat-card variant="metric" [series]="[12, 14, 13, 18]" label="Revenue" value="$248K"></ply-stat-card>
   */
  readonly series = input<readonly number[]>([]);

  protected readonly isMetric = computed(() => this.variant() === 'metric');

  protected readonly hostCls = computed(() =>
    cn(
      this.isMetric()
        ? 'flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
        : 'block',
      this.extraClass(),
    ),
  );

  protected readonly up = computed(() => {
    const d = this.delta();
    if (d === undefined) return true;
    return d >= 0;
  });

  protected readonly showDeltaPill = computed(() => this.isMetric() && this.delta() !== undefined);

  protected readonly deltaLabel = computed(() => {
    const d = this.delta();
    if (d === undefined) return '';
    const pct = d * 100;
    const abs = Math.abs(pct).toFixed(1);
    return `${pct >= 0 ? '+' : '−'}${abs}%`;
  });

  protected readonly deltaPillClass = computed(
    () =>
      `inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
        this.up()
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400'
      }`,
  );

  protected readonly deltaIconClass = computed(() =>
    this.up()
      ? 'h-3.5 w-3.5 stroke-emerald-600 dark:stroke-emerald-400'
      : 'h-3.5 w-3.5 stroke-red-600 dark:stroke-red-400',
  );

  protected readonly sparklineStrokeClass = computed(() =>
    this.up() ? 'stroke-blue-500 dark:stroke-blue-400' : 'stroke-red-500 dark:stroke-red-400',
  );

  protected readonly sparklineViewBox = `0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`;

  protected readonly sparklinePoints = computed(() => {
    const points = this.series();
    if (!points.length) return '';

    const innerW = SPARKLINE_WIDTH - 8;
    const innerH = SPARKLINE_HEIGHT - 8;
    const max = Math.max(...points, 0) || 1;
    const step = points.length > 1 ? innerW / (points.length - 1) : 0;

    return points
      .map((value, i) => {
        const x = 4 + i * step;
        const y = 4 + innerH - (value / max) * innerH;
        return `${x},${y}`;
      })
      .join(' ');
  });

  protected readonly showSparkline = computed(
    () => this.isMetric() && this.series().length > 0 && !!this.sparklinePoints(),
  );

  readonly iconBgClasses = computed(() => {
    const map: Record<StatCardColor, string> = {
      primary: 'bg-blue-50 dark:bg-blue-900/30',
      success: 'bg-green-50 dark:bg-green-900/30',
      danger: 'bg-red-50 dark:bg-red-900/30',
      warning: 'bg-orange-50 dark:bg-orange-900/30',
      accent: 'bg-purple-50 dark:bg-purple-900/30',
      default: 'bg-slate-100 dark:bg-slate-700',
    };
    return map[this.color()] ?? map.default;
  });

  readonly iconStrokeClasses = computed(() => {
    const map: Record<StatCardColor, string> = {
      primary: 'stroke-blue-500',
      success: 'stroke-green-500',
      danger: 'stroke-red-500',
      warning: 'stroke-orange-500',
      accent: 'stroke-purple-500',
      default: 'stroke-slate-500',
    };
    return map[this.color()] ?? map.default;
  });
}
