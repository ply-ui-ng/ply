import {
  Component,
  ElementRef,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { DropdownMenuDirective } from '../dropdown/dropdown.directive';
import { IconComponent } from '../icon/icon.component';
import { MenubarComponent } from './menubar.component';
import { cn } from '../tw-merge/tw-merge';

/**
 * One top-level menu inside `ply-menubar`. Project `ply-dropdown-menu-item`
 * children, plus nested `ply-dropdown-menu` panels on items that use
 * `[ply-dropdown-menu-trigger]` with `placement="right"` (or `left`).
 *
 * @example
 * <ply-menubar-menu label="Edit">
 *   <ply-dropdown-menu-item>Cut</ply-dropdown-menu-item>
 * </ply-menubar-menu>
 */
@Component({
  selector: 'ply-menubar-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DropdownMenuComponent, DropdownMenuDirective, IconComponent],
  templateUrl: './menubar-menu.component.html',
  host: { '[class]': 'hostCls()' },
})
export class MenubarMenuComponent {
  private readonly menubar = inject(MenubarComponent, { optional: true, skipSelf: true });

  /**
   * Visible label on the menubar trigger.
   * @example
   * <ply-menubar-menu label="File"></ply-menubar-menu>
   */
  readonly label = input('');

  /**
   * Extra host classes merged via `cn()`.
   * @example
   * <ply-menubar-menu class="hidden sm:block" label="Help"></ply-menubar-menu>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Disables the trigger so the menu cannot open.
   * @example
   * <ply-menubar-menu label="Help" disabled></ply-menubar-menu>
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly trigger = viewChild(DropdownMenuDirective);
  readonly triggerBtn = viewChild<ElementRef<HTMLButtonElement>>('triggerBtn');

  protected readonly hostCls = computed(() => cn('relative', this.extraClass()));

  /**
   * Whether this menu's dropdown is open.
   * @example
   * if (menu.isOpen()) { … }
   */
  isOpen(): boolean {
    return this.trigger()?.isOpen ?? false;
  }

  /**
   * Open the dropdown (no-op when disabled).
   * @example
   * menu.open();
   */
  open(): void {
    if (this.disabled()) return;
    this.menubar?.setActive(this);
    this.trigger()?.openDropdown();
  }

  /**
   * Move keyboard focus to this menu's trigger.
   * @example
   * menu.focusTrigger();
   */
  focusTrigger(): void {
    this.triggerBtn()?.nativeElement.focus();
  }

  /** @example // Bound on the trigger `(focus)` */
  onTriggerFocus(): void {
    this.menubar?.setActive(this);
  }

  /**
   * When another menu is already open, hovering this trigger switches to it.
   * @example
   * // Bound on the trigger `(pointerenter)`
   */
  onTriggerHover(): void {
    if (this.disabled()) return;
    if (this.menubar?.anyMenuOpen()) this.open();
  }

  protected tabIndex(): number {
    if (this.disabled()) return -1;
    const bar = this.menubar;
    if (!bar) return 0;
    const menus = bar.menus();
    if (!menus.length) return 0;
    return bar.isActive(this) ? 0 : -1;
  }
}
