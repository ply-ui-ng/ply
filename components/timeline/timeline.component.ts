import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * A vertical timeline container. Wrap `ply-timeline-item` elements inside.
 *
 * @example
 * <ply-timeline>
 *   <ply-timeline-item color="primary" icon="check" time="Jan 1">Step one</ply-timeline-item>
 * </ply-timeline>
 */
@Component({
  selector: 'ply-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: { '[class]': 'hostCls()' }
})
export class TimelineComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() => cn('flex flex-col', this.extraClass()));
}
