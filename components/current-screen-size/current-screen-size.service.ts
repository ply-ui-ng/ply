import { Injectable, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * A service that monitors viewport resizing and provides the current CDK breakpoint
 * name (XSmall, Small, Medium, Large, XLarge).
 *
 * @example
 * screen = inject(CurrentScreenSizeService);
 * size = this.screen.currentScreenSize;  // Signal<string>
 */
@Injectable({
  providedIn: 'root'
})
export class CurrentScreenSizeService {
  // Display name map for CDK breakpoints
  private readonly displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge']]);

  private readonly _currentScreenSize = signal('Unknown');

  /** Signal: the current responsive breakpoint name (XSmall, Small, Medium, Large, XLarge). */
  readonly currentScreenSize = this._currentScreenSize.asReadonly();

  constructor() {
    const breakpointObserver = inject(BreakpointObserver);

    breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge])
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this._currentScreenSize.set(this.displayNameMap.get(query) ?? 'Unknown');
          }
        }
      });
  }
}
