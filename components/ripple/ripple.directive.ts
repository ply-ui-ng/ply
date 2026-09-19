import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const DEFAULT_COLOR = 'rgba(255, 255, 255, 0.55)';
const DEFAULT_DURATION = 550;
const INK_START_OPACITY = 0.85;

/**
 * Material-style ink ripple on pointer or keyboard activation.
 * Ensures the host is `position: relative` and clips overflow so the ink
 * stays within rounded corners. Free tier.
 *
 * @example
 * <button ply-button color="primary" ply-ripple>Click me</button>
 *
 * @example
 * <div
 *   ply-ripple
 *   rippleColor="rgba(59, 130, 246, 0.4)"
 *   class="rounded-lg bg-slate-100 p-8 dark:bg-slate-800"
 * >
 *   Surface
 * </div>
 */
@Directive({
  selector: '[ply-ripple]',
})
export class RippleDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);

  private prepared = false;
  private restoredOverflow: string | null = null;
  private readonly active = new Set<HTMLElement>();

  /**
   * Ink color (any CSS color). Defaults to a soft white for filled buttons.
   * Use a dark rgba on light surfaces.
   *
   * @example
   * <button ply-ripple rippleColor="rgba(0, 0, 0, 0.25)">Light</button>
   */
  readonly rippleColor = input(DEFAULT_COLOR);

  /**
   * Always originates from the host center instead of the pointer position.
   *
   * @example
   * <button ply-ripple rippleCentered>Centered</button>
   */
  readonly rippleCentered = input(false, { transform: booleanAttribute });

  /**
   * Disables ripple creation while leaving the directive attached.
   *
   * @example
   * <button ply-ripple [rippleDisabled]="isBusy">Save</button>
   */
  readonly rippleDisabled = input(false, { transform: booleanAttribute });

  /**
   * Animation duration in milliseconds.
   *
   * @example
   * <button ply-ripple [rippleDuration]="800">Slow</button>
   */
  readonly rippleDuration = input(DEFAULT_DURATION, { transform: numberAttribute });

  ngOnDestroy(): void {
    for (const ink of this.active) {
      this.removeInk(ink);
    }
    this.active.clear();

    if (this.restoredOverflow !== null) {
      this.renderer.setStyle(this.el.nativeElement, 'overflow', this.restoredOverflow);
      this.restoredOverflow = null;
    }
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || !this.canRipple()) {
      return;
    }
    this.createRipple(event.clientX, event.clientY);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    if (!this.canRipple()) {
      return;
    }
    // Space on buttons already scrolls some browsers; Enter is enough for a11y feedback.
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.createRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  private canRipple(): boolean {
    if (!isPlatformBrowser(this.platformId) || this.rippleDisabled()) {
      return false;
    }
    const host = this.el.nativeElement;
    if (host.hasAttribute('disabled') || host.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return true;
  }

  private ensureHostPrepared(): void {
    if (this.prepared) {
      return;
    }
    this.prepared = true;
    const host = this.el.nativeElement;
    const style = getComputedStyle(host);

    if (style.position === 'static') {
      this.renderer.setStyle(host, 'position', 'relative');
    }

    if (style.overflow === 'visible') {
      this.restoredOverflow = host.style.overflow || '';
      this.renderer.setStyle(host, 'overflow', 'hidden');
    }
  }

  private createRipple(clientX: number, clientY: number): void {
    this.ensureHostPrepared();

    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    const centered = this.rippleCentered();
    const x = centered ? rect.width / 2 : clientX - rect.left;
    const y = centered ? rect.height / 2 : clientY - rect.top;
    const radius = Math.sqrt(
      Math.max(x, rect.width - x) ** 2 + Math.max(y, rect.height - y) ** 2,
    );
    const diameter = Math.max(radius * 2, 1);
    const duration = Math.max(this.rippleDuration() || DEFAULT_DURATION, 1);
    const color = this.rippleColor()?.trim() || DEFAULT_COLOR;

    const ink = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setAttribute(ink, 'aria-hidden', 'true');
    this.renderer.setStyle(ink, 'position', 'absolute');
    this.renderer.setStyle(ink, 'border-radius', '50%');
    this.renderer.setStyle(ink, 'pointer-events', 'none');
    this.renderer.setStyle(ink, 'left', `${x - radius}px`);
    this.renderer.setStyle(ink, 'top', `${y - radius}px`);
    this.renderer.setStyle(ink, 'width', `${diameter}px`);
    this.renderer.setStyle(ink, 'height', `${diameter}px`);
    this.renderer.setStyle(ink, 'background-color', color);
    this.renderer.setStyle(ink, 'transform', 'scale(0)');
    this.renderer.setStyle(ink, 'opacity', String(INK_START_OPACITY));
    this.renderer.setStyle(ink, 'will-change', 'transform, opacity');
    this.renderer.appendChild(host, ink);
    this.active.add(ink);

    if (typeof ink.animate === 'function') {
      const animation = ink.animate(
        [
          { transform: 'scale(0)', opacity: INK_START_OPACITY },
          { transform: 'scale(1)', opacity: 0 },
        ],
        {
          duration,
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          fill: 'forwards',
        },
      );
      animation.onfinish = () => this.removeInk(ink);
      animation.oncancel = () => this.removeInk(ink);
      return;
    }

    // Fallback when Web Animations API is unavailable
    requestAnimationFrame(() => {
      this.renderer.setStyle(
        ink,
        'transition',
        `transform ${duration}ms cubic-bezier(0, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0, 0, 0.2, 1)`,
      );
      this.renderer.setStyle(ink, 'transform', 'scale(1)');
      this.renderer.setStyle(ink, 'opacity', '0');
    });
    const onEnd = () => {
      ink.removeEventListener('transitionend', onEnd);
      this.removeInk(ink);
    };
    ink.addEventListener('transitionend', onEnd);
  }

  private removeInk(ink: HTMLElement): void {
    if (!this.active.has(ink)) {
      return;
    }
    this.active.delete(ink);
    if (ink.parentNode) {
      this.renderer.removeChild(ink.parentNode, ink);
    }
  }
}
