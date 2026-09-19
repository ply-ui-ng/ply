import {
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { overlayPositions } from '../overlay-position/overlay-position';
import { TemplatePortal } from '@angular/cdk/portal';
import { cn } from '../tw-merge/tw-merge';
import { PopoverPlacement } from '../types';
import { injectTimers } from '../safe-timer/safe-timer';

const GAP = 8;
let hoverCardIdCounter = 0;

/**
 * Rich content panel that opens when the pointer (or keyboard focus) rests on the trigger.
 * Unlike `ply-popover`, there is no backdrop — the pointer can move into the panel.
 * Closes after a short delay on leave, on outside pointer down, and on Escape.
 *
 * @example
 * <ply-hover-card>
 *   <a hover-card-trigger href="/team/ada">Ada Lovelace</a>
 *   <p>Mathematician and first programmer.</p>
 * </ply-hover-card>
 */
@Component({
  selector: 'ply-hover-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule],
  templateUrl: './hover-card.component.html',
  host: { '[class]': 'hostCls()' },
})
export class HoverCardComponent implements OnDestroy {
  private readonly isSsrSafeBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly timers = injectTimers();

  readonly panelId = `ply-hover-card-panel-${++hoverCardIdCounter}`;

  /**
   * Extra host classes merged via `cn()`.
   * @example
   * <ply-hover-card class="align-middle"></ply-hover-card>
   */
  readonly extraClass = input('', { alias: 'class' });

  /**
   * Minimum width of the overlay panel.
   * @example
   * <ply-hover-card minWidth="280px"></ply-hover-card>
   */
  readonly minWidth = input('240px');

  /**
   * Preferred placement relative to the trigger. Flips when there is not enough room.
   * @example
   * <ply-hover-card placement="top"></ply-hover-card>
   */
  readonly placement = input<PopoverPlacement>('bottom-start');

  /**
   * Milliseconds to wait after pointer enter / focus before opening.
   * @example
   * <ply-hover-card [openDelay]="0"></ply-hover-card>
   */
  readonly openDelay = input(200);

  /**
   * Milliseconds to wait after pointer leave before closing (lets the pointer reach the panel).
   * @example
   * <ply-hover-card [closeDelay]="100"></ply-hover-card>
   */
  readonly closeDelay = input(150);

  /**
   * Emits whenever the panel opens or closes.
   * @example
   * <ply-hover-card (openChange)="onOpen($event)"></ply-hover-card>
   */
  readonly openChange = output<boolean>();

  readonly triggerSlot = viewChild<ElementRef<HTMLElement>>('triggerSlot');
  readonly panelTpl = viewChild<TemplateRef<unknown>>('panelTemplate');

  protected readonly hostCls = computed(() => cn('inline-block relative', this.extraClass()));

  readonly isOpen = signal(false);

  private overlayRef: OverlayRef | null = null;
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Open immediately (skips `openDelay`).
   * @example
   * card.open();
   */
  open(): void {
    this.clearTimers();
    if (this.isOpen()) return;
    this.isOpen.set(true);
    this.openChange.emit(true);
    this.attachOverlay();
    if (!this.isSsrSafeBrowser) return;
    document.addEventListener('keydown', this.onKeydown);
    document.addEventListener('pointerdown', this.onPointerDown, true);
  }

  /**
   * Close immediately (skips `closeDelay`).
   * @example
   * card.close();
   */
  close(): void {
    this.clearTimers();
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.openChange.emit(false);
    this.detachOverlay();
    if (this.isSsrSafeBrowser) {
      document.removeEventListener('keydown', this.onKeydown);
      document.removeEventListener('pointerdown', this.onPointerDown, true);
    }
  }

  /** @example // Bound on the trigger `(pointerenter)` */
  onTriggerEnter(): void {
    this.scheduleOpen();
  }

  /** @example // Bound on the trigger `(pointerleave)` */
  onTriggerLeave(): void {
    this.scheduleClose();
  }

  /**
   * Focus leaving the trigger must not use the pointer-leave path. Clicking
   * non-focusable panel content blurs the trigger (`relatedTarget` is null)
   * and a stationary cursor over a newly opened overlay never fires
   * `pointerenter`, so that path would close the card after `closeDelay`.
   * @example // Bound on the trigger `(focusout)`
   */
  onTriggerFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node) {
      if (this.triggerSlot()?.nativeElement.contains(next)) return;
      if (this.overlayRef?.overlayElement.contains(next)) return;
      this.scheduleClose();
      return;
    }
    // Click inside the panel (or a capture-phase outside `pointerdown` that
    // already called `close()`). Do not start the close timer.
  }

  /** @example // Bound on the panel `(pointerenter)` */
  onPanelEnter(): void {
    this.timers.clear(this.closeTimer);
    this.closeTimer = undefined;
  }

  /** @example // Bound on the panel `(pointerleave)` */
  onPanelLeave(): void {
    this.scheduleClose();
  }

  ngOnDestroy(): void {
    this.close();
  }

  private scheduleOpen(): void {
    this.timers.clear(this.closeTimer);
    this.closeTimer = undefined;
    if (this.isOpen()) return;
    this.timers.clear(this.openTimer);
    this.openTimer = this.timers.setTimeout(() => this.open(), this.openDelay());
  }

  private scheduleClose(): void {
    this.timers.clear(this.openTimer);
    this.openTimer = undefined;
    if (!this.isOpen()) return;
    this.timers.clear(this.closeTimer);
    this.closeTimer = this.timers.setTimeout(() => this.close(), this.closeDelay());
  }

  private clearTimers(): void {
    this.timers.clear(this.openTimer);
    this.timers.clear(this.closeTimer);
    this.openTimer = undefined;
    this.closeTimer = undefined;
  }

  private attachOverlay(): void {
    if (!this.isSsrSafeBrowser || this.overlayRef) return;
    const origin = this.triggerSlot()?.nativeElement;
    const template = this.panelTpl();
    if (!origin || !template) return;

    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(origin)
        .withFlexibleDimensions(false)
        .withPush(true)
        .withViewportMargin(GAP)
        .withPositions(overlayPositions(this.placement(), GAP)),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: this.minWidth(),
    });
    this.overlayRef.attach(new TemplatePortal(template, this.viewContainerRef));
    this.overlayRef.overlayElement.style.overflow = 'visible';
    requestAnimationFrame(() => this.overlayRef?.updatePosition());
  }

  private detachOverlay(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  private onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.close();
  };

  private onPointerDown = (e: PointerEvent): void => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (this.triggerSlot()?.nativeElement.contains(target)) return;
    if (this.overlayRef?.overlayElement.contains(target)) return;
    this.close();
  };
}
