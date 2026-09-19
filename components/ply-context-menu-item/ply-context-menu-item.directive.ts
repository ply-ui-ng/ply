import { Directive } from '@angular/core';

/**
 * A stylistic directive that applies standard padding, hover effects, and typography
 * to an element to make it look like a context menu item.
 *
 * @example
 * <button ply-context-menu-item (click)="copy()">Copy</button>
 */
@Directive({
  selector: '[ply-context-menu-item]',
  host: {
    role: 'menuitem',
    tabindex: '-1',
    class:
      'w-full px-4 h-10 flex items-center text-sm transition-colors duration-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap not-prose outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-700',
  },
})
export class BaseContextMenuItemDirective {}
