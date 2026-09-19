import {
  Directive,
  ElementRef,
  OnDestroy,
  ViewContainerRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge, Subscription, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ContextMenuPanel } from './context-menu-panel';
import { ContextMenuComponent } from './context-menu.component';

interface ContextMenuPoint {
  x: number;
  y: number;
}

/**
 * Opens a `ply-context-menu` on right-click (or Shift+F10 / the ContextMenu key)
 * at the pointer position.
 *
 * @example
 * <div [ply-context-menu-trigger]="menu" tabindex="0">Right-click me</div>
 * <ply-context-menu #menu>
 *   <button ply-context-menu-item>Rename</button>
 *   <button ply-context-menu-item>Delete</button>
 * </ply-context-menu>
 */
@Directive({
  selector: '[ply-context-menu-trigger]',
  host: {
    '(contextmenu)': 'onContextMenu($event)',
    '(keydown)': 'onKeydown($event)',
    '[attr.aria-haspopup]': '"menu"',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'ariaControls()',
  },
})
export class ContextMenuDirective<T> implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef?: OverlayRef;
  private closingSubscription = Subscription.EMPTY;
  private lastPointer: ContextMenuPoint = { x: 0, y: 0 };
  /** Bumped on open/close so deferred close microtasks can be cancelled. */
  private menuGeneration = 0;

  /** Whether the context menu overlay is open. */
  readonly isOpen = signal(false);

  /**
   * The reference to the `ply-context-menu` component to open.
   *
   * @example
   * <div [ply-context-menu-trigger]="fileMenu">...</div>
   */
  readonly contextMenuPanel = input.required<ContextMenuPanel<T>>({
    alias: 'ply-context-menu-trigger',
  });

  /**
   * When true, the native browser context menu is not suppressed and the
   * Ply menu will not open.
   *
   * @example
   * <div [ply-context-menu-trigger]="menu" [disabled]="true">...</div>
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly ariaControls = computed(() => {
    const panel = this.contextMenuPanel();
    return panel instanceof ContextMenuComponent ? panel.menuId : null;
  });

  onContextMenu(event: MouseEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.openMenu(this.lastPointer);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    const isContextKey = event.key === 'ContextMenu';
    const isShiftF10 = event.key === 'F10' && event.shiftKey;

    if (isContextKey || isShiftF10) {
      event.preventDefault();
      const rect = this.elementRef.nativeElement.getBoundingClientRect();
      this.lastPointer = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      this.openMenu(this.lastPointer);
      return;
    }

    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.destroyMenu(true);
    }
  }

  /** Programmatically open the menu at an optional point (defaults to last pointer). */
  open(point?: ContextMenuPoint): void {
    if (this.disabled()) return;
    this.openMenu(point ?? this.lastPointer);
  }

  /** Programmatically close the menu. */
  close(): void {
    this.destroyMenu(true);
  }

  private openMenu(point: ContextMenuPoint): void {
    const panel = this.contextMenuPanel();
    if (!panel) return;

    // Cancel any deferred close and tear down an existing overlay before reopening.
    this.menuGeneration++;
    this.teardownOverlay();
    this.isOpen.set(true);

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'bg-transparent',
      scrollStrategy: this.overlay.scrollStrategies.close(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(point)
        .withFlexibleDimensions(false)
        .withPush(true)
        .withPositions(this.getPositions()),
    });

    const templatePortal = new TemplatePortal(panel.templateRef(), this.viewContainerRef);
    this.overlayRef.attach(templatePortal);

    if (panel instanceof ContextMenuComponent) {
      panel.focusFirstItem();
    }

    const itemClicks$ = fromEvent<MouseEvent>(this.overlayRef.overlayElement, 'click').pipe(
      filter((e) => !!(e.target as HTMLElement | null)?.closest('[role="menuitem"]'))
    );

    this.closingSubscription = merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.detachments(),
      outputToObservable(panel.closed),
      itemClicks$
    ).subscribe(() => this.destroyMenu(true));
  }

  private getPositions(): ConnectedPosition[] {
    return [
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
      { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
      { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
    ];
  }

  /**
   * Close the menu. Overlay teardown is immediate; `aria-expanded` + focus restore
   * are deferred so they don't collide with the click CD that closed the menu (NG0100).
   */
  private destroyMenu(restoreFocus = false): void {
    if (!this.overlayRef && !this.isOpen()) {
      return;
    }

    const generation = ++this.menuGeneration;
    this.teardownOverlay();

    // Defer aria-expanded + focus so they don't run inside the menuitem click CD (NG0100).
    queueMicrotask(() => {
      if (generation !== this.menuGeneration) return;
      this.isOpen.set(false);
      if (restoreFocus) {
        this.elementRef.nativeElement.focus?.();
      }
    });
  }

  private teardownOverlay(): void {
    this.closingSubscription.unsubscribe();
    this.closingSubscription = Subscription.EMPTY;

    if (!this.overlayRef) {
      return;
    }

    const ref = this.overlayRef;
    this.overlayRef = undefined;
    // Detach immediately; dispose after the current event so menuitem click handlers finish.
    ref.detach();
    queueMicrotask(() => ref.dispose());
  }

  ngOnDestroy(): void {
    this.closingSubscription.unsubscribe();
    this.closingSubscription = Subscription.EMPTY;
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.isOpen.set(false);
  }
}
