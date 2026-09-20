import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  OnDestroy,
  inject,
  input,
  booleanAttribute,
  effect,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TooltipPlacement } from '../types';
import { OverlayPlacement, overlayPositions } from '../overlay-position/overlay-position';

let tooltipIdCounter = 0;

/**
 * An attribute directive that attaches a floating tooltip to any element.
 * Hides on mouse leave, blur, Escape, or scroll (including nested overflow containers).
 * Position via `tooltipPlacement` — not bare `placement`, which collides with
 * dropdown / popover / drawer on the same host. The panel is a CDK Overlay.
 *
 * @example
 * <button ply-tooltip="This is a helpful tip" tooltipPlacement="right" type="light">Hover Me</button>
 *
 * @example
 * <!-- Safe alongside dropdown/popover `placement` on the same host -->
 * <button
 *   [ply-dropdown-menu-trigger]="menu"
 *   placement="end"
 *   ply-tooltip="Account"
 *   tooltipPlacement="bottom"
 * ></button>
 */
@Directive({
  selector: '[ply-tooltip]',
})
export class TooltipDirective implements OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private overlay = inject(Overlay);

  /** The text content to display inside the tooltip. */
  readonly tooltipTitle = input('', { alias: 'ply-tooltip' });

  /**
   * The positioning of the tooltip relative to the host element. Defaults to 'top'.
   * Use the `tooltipPlacement` template attribute — not bare `placement`, which collides
   * with dropdown, popover, and drawer placement on the same host.
   *
   * @example
   * <span ply-tooltip="Help" tooltipPlacement="bottom">?</span>
   */
  readonly placement = input<TooltipPlacement | string>('top', { alias: 'tooltipPlacement' });

  /** Additional custom CSS classes to apply to the tooltip element. */
  readonly tooltipClass = input('');

  /** Milliseconds to delay before showing the tooltip. Defaults to '0'. */
  readonly delay = input('0');

  /** The visual theme variant. Defaults to 'dark'. */
  readonly type = input<'dark' | 'light' | string>('dark');

  /** Whether the tooltip is permitted to show at all. Defaults to true. */
  readonly canShow = input(true, { transform: booleanAttribute });

  private overlayRef: OverlayRef | null = null;
  private tooltip: HTMLElement | null = null;
  private showTimeout?: ReturnType<typeof setTimeout>;
  private animateInTimeout?: ReturnType<typeof setTimeout>;
  private readonly tooltipId = `ply-tooltip-${tooltipIdCounter++}`;

  constructor() {
    effect(() => {
      const title = this.tooltipTitle();
      this.updateVisibleTitle(title);
    });
  }

  ngOnDestroy(): void {
    this.hide();
  }

  @HostListener('mouseenter') onMouseEnter(): void {
    this.scheduleShow();
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.hide();
  }

  @HostListener('focusin') onFocusIn(): void {
    this.scheduleShow();
  }

  @HostListener('focusout') onFocusOut(): void {
    this.hide();
  }

  @HostListener('keydown.escape') onEscape(): void {
    this.hide();
  }

  private scheduleShow(): void {
    clearTimeout(this.showTimeout);
    this.showTimeout = setTimeout(() => this.show(), parseInt(this.delay(), 10) || 0);
  }

  private show(): void {
    if (!this.canShow() || this.overlayRef || !this.tooltipTitle()) return;

    this.attachOverlay();
    this.renderer.setAttribute(this.el.nativeElement, 'aria-describedby', this.tooltipId);

    clearTimeout(this.animateInTimeout);
    this.animateInTimeout = setTimeout(() => {
      const tooltip = this.tooltip;
      if (!tooltip) return;
      this.renderer.addClass(tooltip, 'opacity-100');

      const startClasses = ['translate-y-2', '-translate-y-2', 'translate-x-2', '-translate-x-2'];
      startClasses.forEach((cls) => this.renderer.removeClass(tooltip, cls));

      const placement = this.placement();
      if (placement === 'top' || placement === 'bottom') {
        this.renderer.addClass(tooltip, 'translate-y-0');
      } else {
        this.renderer.addClass(tooltip, 'translate-x-0');
      }
    }, 0);
  }

  private hide(): void {
    clearTimeout(this.showTimeout);
    clearTimeout(this.animateInTimeout);
    this.renderer.removeAttribute(this.el.nativeElement, 'aria-describedby');
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.tooltip = null;
  }

  /** Keep an already-open tooltip in sync when `ply-tooltip` text changes. */
  private updateVisibleTitle(title: string): void {
    const tooltip = this.tooltip;
    if (!tooltip) return;
    const textNode = tooltip.childNodes[0];
    if (textNode?.nodeType === Node.TEXT_NODE) {
      textNode.textContent = title;
      this.overlayRef?.updatePosition();
    }
  }

  private attachOverlay(): void {
    const placement = this.placement() as OverlayPlacement;
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.el)
        .withFlexibleDimensions(false)
        .withPush(true)
        .withPositions(overlayPositions(placement, 10)),
      scrollStrategy: this.overlay.scrollStrategies.close(),
      panelClass: 'ply-tooltip-overlay-pane',
    });
    this.overlayRef.detachments().subscribe(() => {
      this.renderer.removeAttribute(this.el.nativeElement, 'aria-describedby');
      this.overlayRef = null;
      this.tooltip = null;
    });

    const tooltip = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setAttribute(tooltip, 'id', this.tooltipId);
    this.renderer.setAttribute(tooltip, 'role', 'tooltip');
    const text = this.renderer.createText(this.tooltipTitle());
    this.renderer.appendChild(tooltip, text);

    const baseClasses = [
      'text-sm', 'rounded-md', 'text-center', 'px-2', 'py-1', 'max-w-xs',
      'pointer-events-none', 'opacity-0', 'transition-all', 'duration-300',
      'transform', 'shadow-lg', 'block',
    ];
    baseClasses.forEach((cls) => this.renderer.addClass(tooltip, cls));

    const type = this.type();
    if (type === 'light') {
      this.renderer.addClass(tooltip, 'bg-white');
      this.renderer.addClass(tooltip, 'text-slate-700');
      this.renderer.addClass(tooltip, 'border');
      this.renderer.addClass(tooltip, 'border-slate-200');
    } else {
      this.renderer.addClass(tooltip, 'bg-slate-900');
      this.renderer.addClass(tooltip, 'text-white');
    }

    const arrow = this.renderer.createElement('div');
    this.renderer.addClass(arrow, 'absolute');
    this.renderer.addClass(arrow, 'w-0');
    this.renderer.addClass(arrow, 'h-0');
    this.renderer.addClass(arrow, 'border-4');

    switch (this.placement()) {
      case 'top':
        this.renderer.addClass(tooltip, 'translate-y-2');
        this.renderer.addClass(arrow, 'top-full');
        this.renderer.addClass(arrow, 'left-1/2');
        this.renderer.addClass(arrow, '-translate-x-1/2');
        this.renderer.addClass(arrow, 'border-t-slate-900');
        this.renderer.addClass(arrow, 'border-l-transparent');
        this.renderer.addClass(arrow, 'border-r-transparent');
        this.renderer.addClass(arrow, 'border-b-transparent');
        if (type === 'light') this.renderer.addClass(arrow, 'border-t-white');
        break;
      case 'bottom':
        this.renderer.addClass(tooltip, '-translate-y-2');
        this.renderer.addClass(arrow, 'bottom-full');
        this.renderer.addClass(arrow, 'left-1/2');
        this.renderer.addClass(arrow, '-translate-x-1/2');
        this.renderer.addClass(arrow, 'border-b-slate-900');
        this.renderer.addClass(arrow, 'border-l-transparent');
        this.renderer.addClass(arrow, 'border-r-transparent');
        this.renderer.addClass(arrow, 'border-t-transparent');
        if (type === 'light') this.renderer.addClass(arrow, 'border-b-white');
        break;
      case 'left':
        this.renderer.addClass(tooltip, 'translate-x-2');
        this.renderer.addClass(arrow, 'left-full');
        this.renderer.addClass(arrow, 'top-1/2');
        this.renderer.addClass(arrow, '-translate-y-1/2');
        this.renderer.addClass(arrow, 'border-l-slate-900');
        this.renderer.addClass(arrow, 'border-t-transparent');
        this.renderer.addClass(arrow, 'border-b-transparent');
        this.renderer.addClass(arrow, 'border-r-transparent');
        if (type === 'light') this.renderer.addClass(arrow, 'border-l-white');
        break;
      case 'right':
        this.renderer.addClass(tooltip, '-translate-x-2');
        this.renderer.addClass(arrow, 'right-full');
        this.renderer.addClass(arrow, 'top-1/2');
        this.renderer.addClass(arrow, '-translate-y-1/2');
        this.renderer.addClass(arrow, 'border-r-slate-900');
        this.renderer.addClass(arrow, 'border-t-transparent');
        this.renderer.addClass(arrow, 'border-b-transparent');
        this.renderer.addClass(arrow, 'border-l-transparent');
        if (type === 'light') this.renderer.addClass(arrow, 'border-r-white');
        break;
    }

    this.renderer.appendChild(tooltip, arrow);

    const tooltipClass = this.tooltipClass();
    if (tooltipClass) {
      tooltipClass.split(' ').forEach((cls) => {
        if (cls) this.renderer.addClass(tooltip, cls);
      });
    }

    this.renderer.addClass(tooltip, 'relative');
    this.overlayRef.overlayElement.style.overflow = 'visible';
    this.overlayRef.overlayElement.appendChild(tooltip);
    this.tooltip = tooltip;
  }
}
