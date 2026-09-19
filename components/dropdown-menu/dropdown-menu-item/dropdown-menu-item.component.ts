import {
  Component,
  ChangeDetectionStrategy,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { cn } from '../../tw-merge/tw-merge';

/**
 * An individual item within a `ply-dropdown-menu`.
 *
 * Clicking a normal item closes the menu. Bind `checked` (or set `stayOpen`)
 * for selectable items that toggle without dismissing the dropdown.
 *
 * @example
 * <ply-dropdown-menu>
 *   <ply-dropdown-menu-item>Profile</ply-dropdown-menu-item>
 *   <ply-dropdown-menu-item [(checked)]="wordWrap">Word wrap</ply-dropdown-menu-item>
 * </ply-dropdown-menu>
 */
@Component({
  selector: 'ply-dropdown-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropdown-menu-item.component.html',
  imports: [IconComponent],
  host: {
    '[attr.role]': 'itemRole()',
    tabindex: '-1',
    '[class]': 'hostCls()',
    '[attr.aria-checked]': 'ariaChecked()',
    '[attr.data-stay-open]': 'keepsOpen() ? "" : null',
    '(click)': 'onItemClick()',
  },
})
export class DropdownMenuItemComponent {
  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-dropdown-menu-item class="font-medium">Save</ply-dropdown-menu-item>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * When set, the item is a checkbox (`menuitemcheckbox`) and the menu stays open
   * after click. Two-way bind to toggle.
   *
   * @example
   * <ply-dropdown-menu-item [(checked)]="showSidebar">Sidebar</ply-dropdown-menu-item>
   */
  readonly checked = model<boolean | undefined>(undefined);

  /**
   * Keep the dropdown open after this item is clicked (e.g. a custom toggle).
   * Implied when {@link checked} is bound.
   *
   * @example
   * <ply-dropdown-menu-item stayOpen (click)="toggle()">Pin</ply-dropdown-menu-item>
   */
  readonly stayOpen = input(false, { transform: booleanAttribute });

  protected readonly keepsOpen = computed(
    () => this.stayOpen() || this.checked() !== undefined,
  );

  protected readonly itemRole = computed(() =>
    this.checked() !== undefined ? 'menuitemcheckbox' : 'menuitem',
  );

  protected readonly ariaChecked = computed(() => {
    const value = this.checked();
    return value === undefined ? null : String(value);
  });

  protected readonly hostCls = computed(() =>
    cn(
      'w-full px-6 h-12 flex items-center text-sm transition-colors duration-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap not-prose outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-700',
      this.extraClass(),
    ),
  );

  /** @example // Bound on the host `(click)` */
  protected onItemClick(): void {
    const value = this.checked();
    if (value === undefined) return;
    this.checked.set(!value);
  }
}
