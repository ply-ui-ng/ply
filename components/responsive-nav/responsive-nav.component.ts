import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { cn } from '../tw-merge/tw-merge';
import { BaseDropdownMenuItemDirective } from '../ply-dropdown-menu-item/ply-dropdown-menu-item.directive';
import { IconButtonDirective } from '../button/ply-icon-button.directive';
import { IconStrokedButtonDirective } from '../button/ply-icon-stroked-button.directive';
import { DropdownMenuDirective } from '../dropdown/dropdown.directive';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { IconComponent } from '../icon/icon.component';
import { ResponsiveNavItemComponent } from './responsive-nav-item.component';
import {
  RESPONSIVE_NAV,
  RESPONSIVE_NAV_DEFAULT_LINK_CLASS,
  ResponsiveNavConfig,
} from './responsive-nav-tokens';

/** Gap between nav items — must match Tailwind `gap-1` (4px). */
const GAP_PX = 4;

/**
 * Progressive (priority+) navigation: shows as many projected items as fit
 * and spills the rest into a "More" dropdown from the right as the container
 * shrinks. Leftmost items have highest priority and stay visible longest.
 *
 * @example
 * <ply-responsive-nav>
 *   <ply-responsive-nav-item routerLink="/">Home</ply-responsive-nav-item>
 *   <ply-responsive-nav-item routerLink="/docs">
 *     <ply-icon name="book" class="h-4 w-4 stroke-slate-500"></ply-icon>
 *     Docs
 *   </ply-responsive-nav-item>
 *   <ply-responsive-nav-item href="https://github.com" target="_blank">GitHub</ply-responsive-nav-item>
 * </ply-responsive-nav>
 */
@Component({
  selector: 'ply-responsive-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './responsive-nav.component.html',
  host: { '[class]': 'hostCls()' },
  providers: [
    {
      provide: RESPONSIVE_NAV,
      useExisting: ResponsiveNavComponent,
    },
  ],
  imports: [
    NgTemplateOutlet,
    RouterLink,
    IconComponent,
    IconButtonDirective,
    IconStrokedButtonDirective,
    DropdownMenuComponent,
    DropdownMenuDirective,
    BaseDropdownMenuItemDirective,
  ],
})
export class ResponsiveNavComponent implements ResponsiveNavConfig {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  /**
   * Extra host classes merged via `cn()`.
   *
   * @example
   * <ply-responsive-nav class="min-w-0 flex-1"></ply-responsive-nav>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Tailwind classes applied to each item link.
   *
   * @example
   * <ply-responsive-nav linkClass="px-2 text-xs font-semibold"></ply-responsive-nav>
   */
  readonly linkClass = input(RESPONSIVE_NAV_DEFAULT_LINK_CLASS);

  /**
   * Accessible label for the overflow "More" trigger button.
   *
   * @example
   * <ply-responsive-nav moreLabel="More pages"></ply-responsive-nav>
   */
  readonly moreLabel = input('More navigation links');

  /**
   * Draw the overflow trigger as a stroked icon button, matching toolbar buttons.
   *
   * @example
   * <ply-responsive-nav strokedMore moreLabel="More formatting"></ply-responsive-nav>
   */
  readonly strokedMore = input(false, { transform: booleanAttribute });

  private readonly moreMeasure = viewChild<ElementRef<HTMLElement>>('moreMeasure');

  /** Projected nav items in document order (left = highest priority). */
  readonly items = contentChildren(ResponsiveNavItemComponent);

  /** How many items (from the right) live in the overflow menu. */
  private readonly overflowCount = signal(0);

  protected readonly hostCls = computed(() =>
    cn('relative flex min-w-0 flex-1 items-center gap-1', this.extraClass()),
  );

  protected readonly overflowItems = computed(() => {
    const all = this.items();
    const n = this.overflowCount();
    return n > 0 ? all.slice(all.length - n) : [];
  });

  /** Overflow rows that belong in the More menu. Dividers stay out of it. */
  protected readonly menuItems = computed(() =>
    this.overflowItems().filter((item) => !item.decorative()),
  );

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const ro = new ResizeObserver(() => this.recompute());
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
      this.recompute();
    });

    effect(() => {
      // Re-run when items are added/removed or their measured widths change.
      this.items().forEach((item) => {
        item.measuredWidth();
        item.decorative();
      });
      this.recompute();
    });
  }

  private recompute(): void {
    const all = this.items();
    const total = all.length;
    if (total === 0) {
      this.overflowCount.set(0);
      this.syncOverflow(all, 0);
      return;
    }

    const containerWidth = this.host.nativeElement.clientWidth;
    if (containerWidth <= 0) {
      return;
    }

    const moreEl = this.moreMeasure()?.nativeElement;
    if (!moreEl) {
      return;
    }

    const moreWidth = moreEl.offsetWidth;
    const widths = all.map((item) => item.measuredWidth());

    // If any width is still 0 (not measured yet), wait for ResizeObserver.
    if (widths.some((w) => w <= 0)) {
      return;
    }

    const contentWidth = (count: number) => {
      let width = 0;
      for (let i = 0; i < count; i++) {
        width += widths[i] + (i > 0 ? GAP_PX : 0);
      }
      return width;
    };

    let visibleEnd = total;
    if (contentWidth(total) > containerWidth) {
      visibleEnd = 0;
      for (let keep = total - 1; keep >= 0; keep--) {
        let end = keep;
        while (end > 0 && all[end - 1].decorative()) {
          end--;
        }
        const width = end > 0 ? moreWidth + GAP_PX + contentWidth(end) : moreWidth;
        if (width <= containerWidth) {
          visibleEnd = end;
          break;
        }
      }
    }

    const nextOverflow = total - visibleEnd;
    if (this.overflowCount() !== nextOverflow) {
      this.overflowCount.set(nextOverflow);
    }
    this.syncOverflow(all, visibleEnd);
  }

  /** Hide the tail, including a divider that would otherwise sit against More. */
  private syncOverflow(all: readonly ResponsiveNavItemComponent[], visibleEnd: number): void {
    all.forEach((item, index) => {
      const shouldOverflow = index >= visibleEnd && visibleEnd < all.length;
      if (item.overflow() !== shouldOverflow) {
        item.overflow.set(shouldOverflow);
      }
    });
  }
}
