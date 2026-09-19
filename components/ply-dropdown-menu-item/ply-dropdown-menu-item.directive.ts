import { Directive, booleanAttribute, input } from '@angular/core';

/**
 * A stylistic directive that applies standard padding, hover effects, and typography
 * to an element to make it look like a dropdown menu item.
 *
 * @example
 * <button ply-dropdown-menu-item (click)="doSomething()">Click Me</button>
 * <button ply-dropdown-menu-item stayOpen (click)="toggle()">Keep open</button>
 */
@Directive({
  selector: '[ply-dropdown-menu-item]',
  host: {
    role: 'menuitem',
    tabindex: '-1',
    '[attr.data-stay-open]': 'stayOpen() ? "" : null',
    class:
      'w-full px-6 h-12 flex items-center text-sm transition-colors duration-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap not-prose outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-700',
  },
})
export class BaseDropdownMenuItemDirective {
  /**
   * Keep the dropdown open after this item is clicked.
   *
   * @example
   * <button ply-dropdown-menu-item stayOpen (click)="pin.set(!pin())">Pin</button>
   */
  readonly stayOpen = input(false, { transform: booleanAttribute });
}
