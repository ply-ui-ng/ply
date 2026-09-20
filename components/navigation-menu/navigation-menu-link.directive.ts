import { Directive } from '@angular/core';

/**
 * Styled link inside `ply-navigation-menu`.
 *
 * @example
 * <a ply-navigation-menu-link routerLink="/docs">Docs</a>
 */
@Directive({
  selector: '[ply-navigation-menu-link]',
  host: {
    class:
      'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  },
})
export class NavigationMenuLinkDirective {}
