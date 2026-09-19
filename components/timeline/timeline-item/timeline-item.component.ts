import { Component, computed, input ,
  ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

import { IconComponent } from '../../icon/icon.component';
import { cn } from '../../tw-merge/tw-merge';
import { TimelineColor } from '../../types';

/**
 * A single event within a `ply-timeline`.
 *
 * @example
 * <ply-timeline-item color="primary" icon="check" time="10:00 AM">
 *   <p>Event description</p>
 * </ply-timeline-item>
 */
@Component({
  selector: 'ply-timeline-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './timeline-item.component.html',
  host: { '[class]': 'hostCls()' } })
export class TimelineItemComponent {
  readonly extraClass = input('', { alias: 'class' });
  /** The color of the dot/icon. */
  readonly color = input<TimelineColor>('primary');
  /** Optional icon name from the icon pack displayed inside the dot. */
  readonly icon  = input<string | undefined>(undefined);
  /** Optional timestamp label shown above the content. */
  readonly time  = input<string | undefined>(undefined);
  /** Set to true on the last item to hide the connecting line. */
  readonly last = input(false, { transform: booleanAttribute });

  protected readonly hostCls = computed(() => cn('flex gap-4 relative', this.extraClass()));

  readonly dotClasses = computed(() => {
    const colorMap: Record<TimelineColor, string> = {
      primary: 'bg-blue-500',
      success: 'bg-green-500',
      danger:  'bg-red-500',
      warning: 'bg-orange-500',
      accent:  'bg-purple-500',
      default: 'bg-slate-400 dark:bg-slate-600' };
    return cn(
      'w-8 h-8 min-w-8 rounded-full flex items-center justify-center z-10',
      colorMap[this.color()] ?? colorMap.default
    );
  });
}
