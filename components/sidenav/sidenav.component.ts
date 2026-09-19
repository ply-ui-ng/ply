import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconComponent } from '../icon/icon.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BreadcrumbItemComponent } from '../breadcrumb/breadcrumb-item/breadcrumb-item.component';
import { IconStrokedButtonColor, SidenavLayoutMode } from '../types';
import { cn } from '../tw-merge/tw-merge';
import { injectTimers } from '../safe-timer/safe-timer';
import { IconButtonDirective } from '../button/ply-icon-button.directive';

/**
 * Responsive section shell with a left nav rail and scrollable body.
 * Pair with `ply-sidenav-nav` and `ply-sidenav-body`. On small screens a
 * hamburger toggles the nav; active label is inferred from `routerLinkActive`.
 *
 * @example
 * <ply-sidenav>
 *   <ply-sidenav-nav>
 *     <ply-nav-list>
 *       <button ply-list-item routerLink="overview" routerLinkActive="!text-blue-600 dark:!text-blue-400">Overview</button>
 *     </ply-nav-list>
 *   </ply-sidenav-nav>
 *   <ply-sidenav-body>
 *     <router-outlet></router-outlet>
 *   </ply-sidenav-body>
 * </ply-sidenav>
 *
 * @example
 * <!-- Force mobile chrome inside a narrow preview frame -->
 * <ply-sidenav layout="mobile"></ply-sidenav>
 */
@Component({
  selector: 'ply-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, IconButtonDirective, BreadcrumbComponent, BreadcrumbItemComponent],
  templateUrl: './sidenav.component.html',
  host: { '[class]': 'hostCls()' },
})
export class SidenavComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  /** Timers cancelled automatically on destroy — see utils/safe-timer. */
  private readonly timers = injectTimers();

  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-sidenav class="bg-white dark:bg-slate-900"></ply-sidenav>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Color for the mobile nav toggle button.
   *
   * @example
   * <ply-sidenav color="accent"></ply-sidenav>
   */
  readonly color = input<IconStrokedButtonColor | undefined>(undefined);

  /**
   * Layout chrome mode. `auto` follows the viewport `lg` breakpoint;
   * `mobile` / `desktop` force that chrome (useful for narrow demos).
   *
   * @example
   * <ply-sidenav layout="mobile"></ply-sidenav>
   */
  readonly layout = input<SidenavLayoutMode>('auto');

  protected readonly hostCls = computed(() => cn('flex flex-col w-full h-full overflow-hidden', this.extraClass()));

  /** Whether the mobile hamburger bar should render. */
  readonly showMobileBar = computed(() => {
    const mode = this.layout();
    if (mode === 'mobile') return true;
    if (mode === 'desktop') return false;
    return true; // auto: shown via CSS `lg:hidden`
  });

  readonly mobileBarClass = computed(() => {
    const mode = this.layout();
    if (mode === 'mobile') {
      return 'flex h-10 w-full shrink-0 items-center justify-start border-b border-slate-200 px-4 dark:border-slate-700';
    }
    if (mode === 'desktop') {
      return 'hidden';
    }
    return 'flex h-10 w-full shrink-0 items-center justify-start border-b border-slate-200 px-4 dark:border-slate-700 lg:hidden';
  });

  readonly navRailClass = computed(() => {
    const open = this.navBarOpen();
    const mode = this.layout();
    const base =
      'h-full w-60 min-w-60 max-w-60 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 py-4 transition-all duration-300 dark:border-slate-700 dark:bg-slate-900';
    if (mode === 'desktop') {
      return cn(base, 'ml-0');
    }
    if (mode === 'mobile') {
      return cn(base, open ? 'ml-0' : '-ml-60');
    }
    return cn(base, open ? 'ml-0' : '-ml-60', 'lg:ml-0');
  });

  readonly bodyClass = computed(() => {
    const mode = this.layout();
    const base = 'flex h-full flex-1 flex-col overflow-hidden transition-all duration-300';
    if (mode === 'desktop') {
      return cn(base, 'min-w-0');
    }
    if (mode === 'mobile') {
      return cn(base, 'min-w-full');
    }
    return cn(base, 'min-w-full md:min-w-0');
  });

  readonly navBarOpen = signal(false);
  readonly selectedLabel = signal('Overview');
  readonly parentLabel = signal<string | undefined>(undefined);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updateSelectedLabel());

    effect(() => {
      // Collapse the drawer when entering forced mobile preview.
      if (this.layout() === 'mobile') {
        this.navBarOpen.set(false);
      }
    });
  }

  ngAfterViewInit() {
    this.updateSelectedLabel();
  }

  updateSelectedLabel() {
    this.timers.setTimeout(() => {
      // Scope to this shell's nav slot so nested demos / pages with
      // active text utilities (or their own sidenav) do not steal the label.
      // Match AA `blue-600` and the legacy `blue-500` class, in both Tailwind
      // important placements (`!text-…` and `text-…!`), plus `aria-current`.
      const nav = this.el.nativeElement.querySelector('ply-sidenav-nav') as HTMLElement | null;
      const activeElement = (nav ?? this.el.nativeElement).querySelector(
        [
          '.\\!text-blue-600',
          '.text-blue-600\\!',
          '.\\!text-blue-500',
          '.text-blue-500\\!',
          '[aria-current="page"]',
          '[aria-current="location"]',
        ].join(', '),
      ) as HTMLElement | null;
      if (activeElement) {
        const label =
          Array.from(activeElement.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent?.trim() ?? '')
            .filter(Boolean)
            .join(' ')
            .trim() ||
          activeElement.textContent?.trim() ||
          '';
        if (label) {
          this.selectedLabel.set(label);
        }

        let previous = activeElement.previousElementSibling as HTMLElement | null;
        while (previous) {
          if (previous.tagName.toLowerCase() === 'p') {
            this.parentLabel.set(previous.textContent?.trim());
            break;
          }
          previous = previous.previousElementSibling as HTMLElement | null;
        }

        this.scrollActiveItemToTop(activeElement, nav);
      }
    }, 50);
  }

  /** Bring the active list item to the top of the sidenav (⌘K / deep links). */
  private scrollActiveItemToTop(active: HTMLElement, nav: HTMLElement | null) {
    if (!this.isBrowser) return;
    const scroller = this.findScrollContainer(active, nav);
    if (!scroller) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const itemRect = active.getBoundingClientRect();
    const fullyVisible = itemRect.top >= scrollerRect.top && itemRect.bottom <= scrollerRect.bottom;
    if (fullyVisible) return;

    const top = scroller.scrollTop + (itemRect.top - scrollerRect.top) - 8;
    scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  private findScrollContainer(from: HTMLElement, fallback: HTMLElement | null): HTMLElement | null {
    let current: HTMLElement | null = from.parentElement;
    while (current && current !== this.el.nativeElement) {
      const overflowY = getComputedStyle(current).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight + 1) {
        return current;
      }
      current = current.parentElement;
    }
    return fallback;
  }

  openNavBar() {
    this.navBarOpen.update((open) => !open);
  }

  onNavClick() {
    this.navBarOpen.set(false);
    this.updateSelectedLabel();
  }
}
