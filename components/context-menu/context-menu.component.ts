import {
  Component,
  TemplateRef,
  viewChild,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
} from '@angular/core';
import { ContextMenuPanel } from './context-menu-panel';
import { focusMenuItem, focusMenuItemEdge, focusMenuItemTypeahead } from '../a11y-keyboard/a11y-keyboard';
import { injectTimers } from '../safe-timer/safe-timer';

let contextMenuIdCounter = 0;

/**
 * The container component for a right-click context menu.
 * Designed to be passed into a `[ply-context-menu-trigger]` directive.
 *
 * @example
 * <div [ply-context-menu-trigger]="menu">Right-click me</div>
 * <ply-context-menu #menu>
 *   <button ply-context-menu-item>Copy</button>
 * </ply-context-menu>
 */
@Component({
  selector: 'ply-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './context-menu.component.html',
})
export class ContextMenuComponent<T> implements ContextMenuPanel<T> {
  /** Timers cancelled automatically on destroy — see utils/safe-timer. */
  private readonly timers = injectTimers();
  /**
   * Optional custom width for the context menu container.
   *
   * @example
   * <ply-context-menu size="220px">...</ply-context-menu>
   */
  readonly size = input<string>();

  readonly templateRef = viewChild.required(TemplateRef);
  readonly menuRoot = viewChild<ElementRef<HTMLElement>>('menuRoot');

  /**
   * Emitted when the menu should close (Escape, Tab, or after an item is chosen).
   *
   * @example
   * <ply-context-menu (closed)="onClosed()"></ply-context-menu>
   */
  readonly closed = output<void>();

  /** Stable id referenced by the trigger's aria-controls. */
  readonly menuId = `ply-context-menu-${contextMenuIdCounter++}`;

  readonly menuClasses = computed(
    () =>
      'bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-40 outline-none py-1',
  );

  /** Focus the first menu item after the overlay opens. */
  focusFirstItem(): void {
    this.timers.setTimeout(() => {
      const root = this.menuRoot()?.nativeElement;
      if (!root) return;
      root.focus();
      focusMenuItemEdge(root, 'first');
    });
  }

  onMenuKeydown(event: KeyboardEvent): void {
    const root = this.menuRoot()?.nativeElement;
    if (!root) return;

    const active = document.activeElement as HTMLElement | null;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusMenuItem(root, active, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusMenuItem(root, active, -1);
        break;
      case 'Home':
        event.preventDefault();
        focusMenuItemEdge(root, 'first');
        break;
      case 'End':
        event.preventDefault();
        focusMenuItemEdge(root, 'last');
        break;
      case 'Escape':
        event.preventDefault();
        this.closed.emit();
        break;
      case 'Tab':
        this.closed.emit();
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          if (focusMenuItemTypeahead(root, event.key, active)) {
            event.preventDefault();
          }
        }
        break;
    }
  }
}
