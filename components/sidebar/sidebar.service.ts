import { Injectable, signal } from '@angular/core';

/**
 * Open/close boolean for a simple app rail (the docs site sidebar uses this).
 * It is not a layout primitive. For a docs/section rail copy `sidenav`.
 * For product chrome (page/dashboard modes, drawers, mini rail) copy `shell`
 * and use `ShellService` from that tree.
 *
 * @example
 * sidebar = inject(SidebarService);
 * toggle() { this.sidebar.toggle(); }
 * isOpen = this.sidebar.isOpen;
 */
@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly _isOpen = signal(true);

  /** Signal: whether the sidebar is currently open. */
  readonly isOpen = this._isOpen.asReadonly();

  toggle() {
    this._isOpen.update(v => !v);
  }

  setOpen(open: boolean) {
    this._isOpen.set(open);
  }
}
