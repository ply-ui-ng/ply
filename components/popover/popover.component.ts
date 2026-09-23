import {
  DestroyRef,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { injectElementDirection } from '../direction/inject-direction';
import { overlayPositions } from '../overlay-position/overlay-position';
import { TemplatePortal } from '@angular/cdk/portal';
import { cn } from '../tw-merge/tw-merge';
import { PopoverPlacement } from '../types';

const GAP = 8;
let popoverIdCounter = 0;

/**
 * A self-contained popover with trigger and panel slots.
 * Place the trigger inside the `[popover-trigger]` slot; place panel content as default children.
 * The panel is a CDK overlay attached to the viewport so it stays next to the trigger
 * even inside `overflow: hidden` parents.
 *
 * @example
 * <ply-popover placement="bottom-start">
 *   <button popover-trigger ply-button>Open</button>
 *   <div>Panel content here</div>
 * </ply-popover>
 */
@Component({
  selector: 'ply-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [A11yModule],
  templateUrl: './popover.component.html',
  host: { '[class]': 'hostCls()' },
})
export class PopoverComponent implements OnDestroy {
  private readonly writingDirection = injectElementDirection();
  /** Lifecycle owner for takeUntilDestroyed — see rxjs-interop. */
  private readonly destroyRef = inject(DestroyRef);
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly panelId = `ply-popover-panel-${++popoverIdCounter}`;

  /**
   * Extra host classes merged via `cn()`.
   * @example
   * <ply-popover class="align-middle"></ply-popover>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Minimum width of the overlay panel.
   * @example
   * <ply-popover minWidth="280px"></ply-popover>
   */
  readonly minWidth = input('200px');

  /**
   * Preferred placement relative to the trigger. Flips when there is not enough room.
   * @example
   * <ply-popover placement="top-end"></ply-popover>
   */
  readonly placement = input<PopoverPlacement>('bottom-start');

  readonly triggerSlot = viewChild<ElementRef<HTMLElement>>('triggerSlot');

  constructor() {
    // The wrapper is the accessible trigger (role=button + tabindex=0), so the
    // projected native button must not create a second keyboard stop.
    effect(() => {
      const slot = this.triggerSlot();
      if (!slot) return;
      slot.nativeElement.querySelector('[popover-trigger]')?.setAttribute('tabindex', '-1');
    });
  }
  readonly panelTpl = viewChild<TemplateRef<unknown>>('panelTemplate');

  protected readonly hostCls = computed(() => cn('inline-block relative', this.extraClass()));

  readonly isOpen = signal(false);

  private overlayRef: OverlayRef | null = null;
  private openTimeout?: number;
  private previouslyFocused: HTMLElement | null = null;
  private runtimePlacement?: PopoverPlacement;
  private runtimeOrigin?: HTMLElement;

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  /**
   * Toggle with an optional placement override — used by `[ply-popover-trigger]`.
   * Pass the external trigger element so the overlay anchors to it.
   *
   * @example
   * popover.toggleWithPlacement('bottom-end', triggerEl);
   */
  toggleWithPlacement(pl: PopoverPlacement, origin?: HTMLElement): void {
    this.runtimePlacement = pl;
    this.runtimeOrigin = origin;
    this.toggle();
  }

  open(): void {
    if (this.isOpen()) return;
    this.previouslyFocused = this.isSsrSafeBrowser
      ? (document.activeElement as HTMLElement | null)
      : null;
    this.isOpen.set(true);
    this.attachOverlay();
    if (!this.isSsrSafeBrowser) return;
    document.addEventListener('keydown', this.onKeydown);
    window.clearTimeout(this.openTimeout);
    this.openTimeout = window.setTimeout(() => {
      if (!this.isOpen()) return;
      this.focusFirstPanelElement();
    });
  }

  close(): void {
    if (this.isSsrSafeBrowser) window.clearTimeout(this.openTimeout);
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.restoreFocus();
    this.detachOverlay();
    this.runtimeOrigin = undefined;
    if (this.isSsrSafeBrowser) document.removeEventListener('keydown', this.onKeydown);
  }

  ngOnDestroy(): void {
    if (!this.isSsrSafeBrowser) return;
    this.close();
  }

  private attachOverlay(): void {
    if (!this.isSsrSafeBrowser || this.overlayRef) return;
    const origin = this.runtimeOrigin ?? this.triggerSlot()?.nativeElement;
    const template = this.panelTpl();
    if (!origin || !template) return;

    const placement = this.runtimePlacement ?? this.placement();
    this.overlayRef = this.overlay.create({
      direction: this.writingDirection(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(origin)
        .withFlexibleDimensions(false)
        .withPush(true)
        .withViewportMargin(GAP)
        .withPositions(overlayPositions(placement, GAP, this.writingDirection())),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: this.minWidth(),
    });
    this.overlayRef.attach(new TemplatePortal(template, this.viewContainerRef));
    this.overlayRef.overlayElement.style.overflow = 'visible';
    queueMicrotask(() => {
      this.overlayRef?.backdropClick().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.close());
    });
    requestAnimationFrame(() => this.overlayRef?.updatePosition());
  }

  private detachOverlay(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  private focusFirstPanelElement(): void {
    const root = this.overlayRef?.overlayElement;
    const focusable = root?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }

  private restoreFocus(): void {
    (this.previouslyFocused ?? this.triggerSlot()?.nativeElement)?.focus();
    this.previouslyFocused = null;
  }

  private onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.close();
  };
}
