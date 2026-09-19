import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { cn } from '../tw-merge/tw-merge';
import {
  RESPONSIVE_NAV,
  RESPONSIVE_NAV_DEFAULT_LINK_CLASS,
} from './responsive-nav-tokens';

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
}
