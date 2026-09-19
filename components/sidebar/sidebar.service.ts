import { Injectable, signal } from '@angular/core';

/**
 * A service to control the visibility state of the application sidebar.
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
