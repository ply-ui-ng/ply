import {
  Component,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
  computed,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';
import { cn } from '../tw-merge/tw-merge';
import { DropdownMenuStack } from '../dropdown-menu-stack/dropdown-menu-stack.service';
import { MenubarMenuComponent } from './menubar-menu.component';

/**
 * Horizontal application menubar. Project `ply-menubar-menu` children; each
 * menu opens a `ply-dropdown-menu` of actions. Click a top-level trigger to
 * open the first menu; after that, hover switches menus and opens nested
 * submenus. Click a leaf / link or outside to close. Bind `checked` (or
 * `stayOpen`) on items that should toggle without dismissing the menu.
 * Arrow Left/Right move between menus (and switch the open menu); Arrow Down /
 * Enter / Space open; Escape closes.
 *
 * @example
 * <ply-menubar>
 *   <ply-menubar-menu label="File">
 *     <ply-dropdown-menu-item>New Tab</ply-dropdown-menu-item>
 *   </ply-menubar-menu>
 * </ply-menubar>
 */
@Component({
  selector: 'ply-menubar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './menubar.component.html',
  host: {
    role: 'menubar',
    '[class]': 'hostCls()',
  },
})
export class MenubarComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly menuStack = inject(DropdownMenuStack);

  /**
   * Extra host classes merged via `cn()`.
   * @example
   * <ply-menubar class="w-full"></ply-menubar>
   */
  readonly extraClass = input('', { alias: 'class' });

  readonly menus = contentChildren(MenubarMenuComponent);

  /** Index of the focused (and optionally open) menu in {@link menus}. */
  readonly activeIndex = signal(0);

  protected readonly hostCls = computed(() =>
    cn(
      'inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800',
      this.extraClass(),
    ),
  );

  /**
   * True when any child menu panel is open.
   * @example
   * if (menubar.anyMenuOpen()) { … }
   */
  anyMenuOpen(): boolean {
    return this.menus().some((m) => m.isOpen());
  }

  /**
   * Whether `menu` is the roving-tabindex target. Disabled menus are never
   * the tab stop; if `activeIndex` points at a disabled menu (including the
   * default `0`), the first enabled menu is used instead.
   * @example
   * [attr.tabindex]="menubar.isActive(this) ? 0 : -1"
   */
  isActive(menu: MenubarMenuComponent): boolean {
    return this.tabStop() === menu;
  }

  /**
   * Enabled menu that should receive `tabindex="0"`.
   * @example
   * menubar.tabStop()?.focusTrigger();
   */
  tabStop(): MenubarMenuComponent | undefined {
    const list = this.menus();
    const current = list[this.activeIndex()];
    if (current && !current.disabled()) return current;
    return list.find((m) => !m.disabled());
  }

  /**
   * Mark `menu` as the active roving item (called on focus / hover-open).
   * @example
   * menubar.setActive(this);
   */
  setActive(menu: MenubarMenuComponent): void {
    const i = this.menus().indexOf(menu);
    if (i >= 0) this.activeIndex.set(i);
  }

  @HostListener('keydown', ['$event'])
  onHostKeydown(event: KeyboardEvent): void {
    this.handleKey(event, false);
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.anyMenuOpen()) return;
    // Triggers already handled by `onHostKeydown`; this catches keys from the overlay pane.
    if (this.host.nativeElement.contains(event.target as Node)) return;
    this.handleKey(event, true);
  }

  private handleKey(event: KeyboardEvent, fromDocument: boolean): void {
    const key = event.key;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') {
      return;
    }

    if (fromDocument) {
      // The open menu already uses Home/End for first/last item. Handling
      // them here would steal focus back to a top-level trigger.
      if (key === 'Home' || key === 'End') {
        return;
      }
      // Nested submenus own ArrowLeft/Right for cascade unwind / open.
      if ((key === 'ArrowLeft' || key === 'ArrowRight') && this.menuStack.size > 1) {
        return;
      }
    } else if (!this.host.nativeElement.contains(event.target as Node)) {
      return;
    }

    const enabled = this.menus().filter((m) => !m.disabled());
    if (!enabled.length) return;

    const current = this.menus()[this.activeIndex()] ?? enabled[0];
    const i = Math.max(0, enabled.indexOf(current));
    let next: (typeof enabled)[number];

    if (key === 'Home') next = enabled[0];
    else if (key === 'End') next = enabled[enabled.length - 1];
    else {
      const delta = key === 'ArrowRight' ? 1 : -1;
      next = enabled[(i + delta + enabled.length) % enabled.length];
    }

    if (next === current && key !== 'Home' && key !== 'End') return;

    event.preventDefault();
    event.stopPropagation();
    const wasOpen = this.anyMenuOpen();
    this.setActive(next);
    next.focusTrigger();
    if (wasOpen) next.open();
  }
}
