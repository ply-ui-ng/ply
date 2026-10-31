import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { cn } from '../tw-merge/tw-merge';
import {
  RESPONSIVE_NAV,
  RESPONSIVE_NAV_DEFAULT_LINK_CLASS,
} from './responsive-nav-tokens';

/**
 * Custom rows for the overflow menu. Use this when a single label click is
 * not enough, for example a heading picker that should list each style.
 *
 * @example
 * <ply-responsive-nav-item menuLabel="Style">
 *   <button type="button">Style</button>
 *   <ng-template plyResponsiveNavMenu>
 *     <button type="button" ply-dropdown-menu-item>Paragraph</button>
 *   </ng-template>
 * </ply-responsive-nav-item>
 */
@Directive({
  selector: 'ng-template[plyResponsiveNavMenu]',
})
export class ResponsiveNavMenuDirective {
  readonly template = inject(TemplateRef<void>);
}

/**
 * A projected link inside `ply-responsive-nav`. Put the label (and optional
 * icon) in the content; set `routerLink` or `href` for navigation.
 *
 * @example
 * <ply-responsive-nav-item routerLink="/docs">
 *   <ply-icon name="book" class="h-4 w-4 stroke-slate-500"></ply-icon>
 *   Docs
 * </ply-responsive-nav-item>
 *
 * @example
 * <ply-responsive-nav-item href="https://github.com" target="_blank">
 *   GitHub
 * </ply-responsive-nav-item>
 *
 * @example
 * <ply-responsive-nav-item menuLabel="Bold">
 *   <button type="button" (click)="bold()">B</button>
 * </ply-responsive-nav-item>
 */
@Component({
  selector: 'ply-responsive-nav-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './responsive-nav-item.component.html',
  host: {
    '[class]': 'hostCls()',
    '[hidden]': 'overflow()',
    '[attr.aria-hidden]': 'overflow() ? "true" : null',
  },
})
export class ResponsiveNavItemComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly nav = inject(RESPONSIVE_NAV, { optional: true });

  /**
   * Extra classes merged onto the inner link/span.
   *
   * @example
   * <ply-responsive-nav-item class="text-blue-600" routerLink="/pricing">Pricing</ply-responsive-nav-item>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * In-app route (`RouterLink`). Wins over `href` when both are set.
   *
   * @example
   * <ply-responsive-nav-item routerLink="/base-elements">Components</ply-responsive-nav-item>
   */
  readonly routerLink = input<string | readonly (string | number)[] | undefined>(undefined);

  /**
   * Absolute or external URL when not using `routerLink`.
   *
   * @example
   * <ply-responsive-nav-item href="https://example.com" target="_blank">Site</ply-responsive-nav-item>
   */
  readonly href = input<string | undefined>(undefined);

  /**
   * Optional `target` for `href` links (e.g. `_blank`).
   *
   * @example
   * <ply-responsive-nav-item href="https://example.com" target="_blank">Site</ply-responsive-nav-item>
   */
  readonly target = input<string | undefined>(undefined);

  /**
   * Label used in the overflow "More" menu. Defaults to the projected text.
   *
   * @example
   * <ply-responsive-nav-item routerLink="/docs" menuLabel="Documentation">
   *   <ply-icon name="book" class="h-4 w-4 stroke-slate-500"></ply-icon>
   *   Docs
   * </ply-responsive-nav-item>
   */
  readonly menuLabel = input<string | undefined>(undefined);

  /**
   * Measured in the bar, then hidden with the overflow, and left out of the
   * More menu. Use for dividers between groups.
   *
   * @example
   * <ply-responsive-nav-item decorative>
   *   <ply-divider [vertical]="true" class="mx-1 h-6"></ply-divider>
   * </ply-responsive-nav-item>
   */
  readonly decorative = input(false, { transform: booleanAttribute });

  private readonly menuSlot = contentChild(ResponsiveNavMenuDirective);

  /** Cached width while visible — used by the parent priority+ algorithm. */
  readonly measuredWidth = signal(0);

  /** Set by `ply-responsive-nav` when this item spills into the More menu. */
  readonly overflow = signal(false);

  protected readonly hostCls = computed(() => 'inline-flex shrink-0');

  protected readonly linkCls = computed(() =>
    cn(this.nav?.linkClass() ?? RESPONSIVE_NAV_DEFAULT_LINK_CLASS, this.extraClass()),
  );

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const update = () => {
        if (!this.overflow()) {
          this.measuredWidth.set(el.offsetWidth);
        }
      };

      const ro = new ResizeObserver(update);
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
      update();
    });
  }

  /** Text for the overflow dropdown (icons are bar-only). */
  menuText(): string {
    const explicit = this.menuLabel()?.trim();
    if (explicit) {
      return explicit;
    }
    return (this.host.nativeElement.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  /** Custom overflow rows, when the item projects `plyResponsiveNavMenu`. */
  menuTemplate(): TemplateRef<void> | undefined {
    return this.menuSlot()?.template;
  }

  /** True when the bar control is a button the More menu can run. */
  hasProjectedControl(): boolean {
    return this.projectedControl() !== null;
  }

  /** Disabled state of the projected button, so the More row can match it. */
  projectedControlDisabled(): boolean {
    return this.projectedControl()?.disabled ?? false;
  }

  /** Run the projected button. Links use their own overflow row instead. */
  activateProjected(): void {
    this.projectedControl()?.click();
  }

  private projectedControl(): HTMLButtonElement | null {
    const control = this.host.nativeElement.querySelector('button');
    return control instanceof HTMLButtonElement ? control : null;
  }
}
