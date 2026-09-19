import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  inject,
  input
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Reveals the host element with a fade + slide-up animation the first time it
 * scrolls into the viewport. Respects `prefers-reduced-motion` and is a no-op
 * during server-side rendering.
 *
 * @example
 * <div plyReveal>Fades in on scroll</div>
 * <div plyReveal [revealDelay]="150" [revealTranslate]="32">Staggered</div>
 */
@Directive({
  selector: '[plyReveal]'
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  /** Delay in milliseconds before the reveal animation starts once visible. */
  readonly revealDelay = input(0);

  /** Distance in pixels the element travels upward while revealing. */
  readonly revealTranslate = input(24);

  /** Duration of the reveal animation in milliseconds. */
  readonly revealDuration = input(600);

  private observer?: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') return;

    const node = this.el.nativeElement;
    this.renderer.setStyle(node, 'opacity', '0');
    this.renderer.setStyle(node, 'transform', `translateY(${this.revealTranslate()}px)`);
    this.renderer.setStyle(node, 'will-change', 'opacity, transform');

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.observer?.disconnect();
            this.reveal(node);
          }
        },
        { threshold: 0.15 }
      );
      this.observer.observe(node);
    });
  }

  private reveal(node: HTMLElement) {
    this.renderer.setStyle(
      node,
      'transition',
      `opacity ${this.revealDuration()}ms ease-out ${this.revealDelay()}ms, transform ${this.revealDuration()}ms ${this.revealDelay()}ms`
    );
    // Next frame so the transition picks up the style change.
    requestAnimationFrame(() => {
      this.renderer.setStyle(node, 'opacity', '1');
      this.renderer.setStyle(node, 'transform', 'translateY(0)');
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
