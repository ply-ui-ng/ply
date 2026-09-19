import { InjectionToken, Signal } from '@angular/core';

/** Shared config from `ply-responsive-nav` to its item children. */
export interface ResponsiveNavConfig {
  readonly linkClass: Signal<string>;
}

export const RESPONSIVE_NAV = new InjectionToken<ResponsiveNavConfig>('RESPONSIVE_NAV');

/** Default classes applied to each nav item link. */
export const RESPONSIVE_NAV_DEFAULT_LINK_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white whitespace-nowrap';
