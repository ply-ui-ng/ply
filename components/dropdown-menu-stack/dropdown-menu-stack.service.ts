import { Injectable } from '@angular/core';

/**
 * Tracks open dropdown overlays so cascading (nested) menus can stay open
 * until a leaf item is chosen, Escape unwinds one level, or the root backdrop closes all.
 */
export interface DropdownMenuStackEntry {
  /** Detach this overlay only (idempotent). */
  closeOverlay(restoreFocus?: boolean): void;
  /** True when `el` is inside this entry's overlay pane. */
  containsElement(el: Element): boolean;
}

/**
 * Root-level stack of open `ply-dropdown-menu` overlays for cascade support.
 *
 * @example
 * // Injected by DropdownMenuDirective — consumers rarely need this directly.
 * inject(DropdownMenuStack).closeAll();
 */
@Injectable({ providedIn: 'root' })
export class DropdownMenuStack {
  private readonly entries: DropdownMenuStackEntry[] = [];

  /** Number of currently open dropdown overlays. */
  get size(): number {
    return this.entries.length;
  }

  /**
   * Prepare to open `trigger`: close menus that are not ancestors of its host element,
   * then push it once opened via {@link push}.
   *
   * @example
   * stack.closeNonAncestors(triggerEl);
   */
  closeNonAncestors(triggerEl: Element): void {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      if (this.entries[i].containsElement(triggerEl)) {
        this.closeAfter(i);
        return;
      }
    }
    this.closeAll(false);
  }

  /**
   * @example
   * stack.push(entry);
   */
  push(entry: DropdownMenuStackEntry): void {
    if (!this.entries.includes(entry)) {
      this.entries.push(entry);
    }
  }

  /**
   * @example
   * stack.pop(entry);
   */
  pop(entry: DropdownMenuStackEntry): void {
    const i = this.entries.indexOf(entry);
    if (i >= 0) this.entries.splice(i, 1);
  }

  /**
   * Close `entry` and every nested menu opened after it.
   *
   * @example
   * stack.closeFrom(entry, true);
   */
  closeFrom(entry: DropdownMenuStackEntry, restoreFocus = false): void {
    const i = this.entries.indexOf(entry);
    if (i < 0) {
      entry.closeOverlay(restoreFocus);
      return;
    }
    this.closeAfter(i - 1, restoreFocus);
  }

  /**
   * Close every open dropdown.
   *
   * @example
   * stack.closeAll(true);
   */
  closeAll(restoreFocus = false): void {
    this.closeAfter(-1, restoreFocus);
  }

  /**
   * Close entries with index > `index`. Pass `-1` to close the entire stack.
   * Focus is restored on the shallowest menu being closed (`index + 1`).
   */
  private closeAfter(index: number, restoreFocus = false): void {
    for (let j = this.entries.length - 1; j > index; j--) {
      const entry = this.entries[j];
      entry.closeOverlay(restoreFocus && j === index + 1);
    }
  }
}
