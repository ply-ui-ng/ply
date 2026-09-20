import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { cn } from '../tw-merge/tw-merge';

/**
 * Horizontal site navigation. Project links (`ply-navigation-menu-link`) and
 * dropdown items (`ply-navigation-menu-item`). For app menus use `ply-menubar`;
 * for overflowing top nav use `ply-responsive-nav`; for a docs rail use `ply-sidenav`.
 *
 * @example
 * <ply-navigation-menu ariaLabel="Product">
 *   <a ply-navigation-menu-link routerLink="/">Home</a>
 *   <ply-navigation-menu-item label="Products">
 *     <a routerLink="/pro" class="block rounded-md px-3 py-2">Pro</a>
 *   </ply-navigation-menu-item>
 * </ply-navigation-menu>
 */
@Component({
  selector: 'ply-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'hostCls()',
  },
})
export class NavigationMenuComponent {
  readonly extraClass = input('', { alias: 'class' });
  readonly ariaLabel = input('Main');

  protected readonly hostCls = computed(() =>
    cn('flex flex-wrap items-center gap-1', this.extraClass()),
  );
}
