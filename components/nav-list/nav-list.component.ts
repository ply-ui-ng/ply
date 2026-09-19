import { Component, computed, input ,
  ChangeDetectionStrategy
} from '@angular/core';

import { cn } from '../tw-merge/tw-merge';

/**
 * A navigation list container. Usually used inside sidebars or drawer menus.
 *
 * @example
 * <ply-nav-list>
 *   <a ply-list-item>Dashboard</a>
 *   <a ply-list-item>Settings</a>
 * </ply-nav-list>
 */
@Component({
  selector: 'ply-nav-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './nav-list.component.html',
  host: {
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'hostCls()',
  },
})
export class NavListComponent {
  readonly extraClass = input('', { alias: 'class' });
  readonly ariaLabel = input('Navigation');
  protected readonly hostCls = computed(() => cn('block w-full', this.extraClass()));
}
