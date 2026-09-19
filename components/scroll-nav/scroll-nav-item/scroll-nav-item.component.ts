import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { cn } from '../../tw-merge/tw-merge';

/**
 * A section within a scroll-nav component that is linked to a sidebar item.
 *
 * @example
 * <ply-scroll-nav-item id="section-1">
 *   Section content
 * </ply-scroll-nav-item>
 */
@Component({
  selector: 'ply-scroll-nav-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './scroll-nav-item.component.html',
  host: { '[class]': 'hostCls()' } })
export class ScrollNavItemComponent {
  readonly extraClass = input('', { alias: 'class' });
  protected readonly hostCls = computed(() => cn('block', this.extraClass()));
}
