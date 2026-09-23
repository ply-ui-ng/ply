import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  OnDestroy,
  ViewContainerRef,
  inject,
  input,
} from '@angular/core';
import { DropdownPanel } from '../dropdown-menu/dropdown-panel';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { isInlineBackwardKey, isInlineForwardKey } from '../direction/direction';
import { injectElementDirection } from '../direction/inject-direction';
import { DropdownPlacement } from '../types';
import { dropdownConnectedPositions } from '../overlay-position/overlay-position';
import {
  DropdownMenuStack,
  DropdownMenuStackEntry,
} from '../dropdown-menu-stack/dropdown-menu-stack.service';

/**
 * A directive that attaches a `ply-dropdown-menu` to a trigger element (like a button).
 * Automatically handles overlay positioning, backdrop clicks, and detachment.
 * Supports cascading submenus: put `[ply-dropdown-menu-trigger]` on a menu item with
 * `placement="right"` (or `left`). Nested menus open on hover once the parent cascade
 * is open; leaf clicks and outside clicks close.
 *
 * @example
 * <button [ply-dropdown-menu-trigger]="myMenu" placement="end">Open</button>
 * <ply-dropdown-menu #myMenu>
 *   <ply-dropdown-menu-item>Action</ply-dropdown-menu-item>
 * </ply-dropdown-menu>
 *
 * @example
 * <!-- Cascading submenu -->
 * <button ply-dropdown-menu-item [ply-dropdown-menu-trigger]="sub" placement="right">More</button>
 * <ply-dropdown-menu #sub>
 *   <ply-dropdown-menu-item>Nested action</ply-dropdown-menu-item>
 * </ply-dropdown-menu>
 */
@Directive({
  selector: '[ply-dropdown-menu-trigger]',
  host: {
    '(click)': 'onTriggerClick($event)',
  },
})
export class DropdownMenuDirective<T> implements OnDestroy, DropdownMenuStackEntry {
  private readonly writingDirection = injectElementDirection();
  private isDropdownOpen = false;
  private overlayRef?: OverlayRef;
  private closingSubscription = Subscription.EMPTY;

  /** The physical placement of the dropdown relative to the trigger. Defaults to 'end'. */
  readonly placement = input<DropdownPlacement>('end');

  /** The reference to the `ply-dropdown-menu` component to open. */
  readonly dropdownPanel = input.required<DropdownPanel<T>>({
    alias: 'ply-dropdown-menu-trigger',
  });

  private overlay = inject(Overlay);
  private elementRef = inject(ElementRef<HTMLElement>);
  private viewContainerRef = inject(ViewContainerRef);
  private readonly menuStack = inject(DropdownMenuStack);

  @HostBinding('attr.aria-haspopup') readonly ariaHasPopup = 'menu';

  @HostBinding('attr.aria-expanded')
  get ariaExpanded(): boolean {
    return this.isDropdownOpen;
  }

  /**
   * Whether the linked dropdown panel is currently open.
   *
   * @example
   * if (trigger.isOpen) { … }
   */
  get isOpen(): boolean {
    return this.isDropdownOpen;
  }

  @HostBinding('attr.aria-controls')
  get ariaControls(): string | null {
    const panel = this.dropdownPanel();
    return panel instanceof DropdownMenuComponent ? panel.menuId : null;
  }

  /**
   * Toggle on click. Stops propagation so a parent menu does not treat this
   * as a leaf item selection when this trigger is itself a menu item.
   * Nested submenu triggers stay open on click (they open on hover once the
   * parent cascade is active); a click would otherwise close the menu that
   * `pointerenter` just opened.
   *
   * @example
   * // Bound via host `(click)`
   */
  onTriggerClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isNestedTrigger()) {
      if (!this.isDropdownOpen) this.openDropdown();
      return;
    }
    this.isDropdownOpen ? this.menuStack.closeFrom(this, true) : this.openDropdown();
  }

  /**
   * Once any menu in the cascade is open, hovering a nested trigger opens it
   * (classic menubar / cascading-menu behavior).
   *
   * @example
   * // Bound via host `(pointerenter)`
   */
  @HostListener('pointerenter')
  onPointerEnter(): void {
    if (!this.isNestedTrigger() || this.menuStack.size === 0) return;
    this.openDropdown(false);
  }

  @HostListener('keydown', ['$event'])
  onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        if (!this.isDropdownOpen) {
          event.preventDefault();
          event.stopPropagation();
          this.openDropdown();
        }
        break;
      case 'ArrowRight':
      case 'ArrowLeft': {
        const dir = this.writingDirection();
        const physicalOpen =
          (event.key === 'ArrowRight' && this.placement() === 'right') ||
          (event.key === 'ArrowLeft' && this.placement() === 'left');
        const forward = isInlineForwardKey(event.key, dir);
        const backward = isInlineBackwardKey(event.key, dir);
        if (!this.isDropdownOpen && (physicalOpen || (this.isNestedTrigger() && forward))) {
          event.preventDefault();
          event.stopPropagation();
          this.openDropdown();
        } else if (this.isDropdownOpen && this.isNestedTrigger() && backward) {
          event.preventDefault();
          event.stopPropagation();
          this.menuStack.closeFrom(this, true);
        }
        break;
      }
      case 'Escape':
        if (this.isDropdownOpen) {
          event.preventDefault();
          this.menuStack.closeFrom(this, true);
        }
        break;
    }
  }

  /**
   * Whether this trigger sits inside an already-open dropdown overlay (submenu).
   *
   * @example
   * if (this.isNestedTrigger()) { … }
   */
  private isNestedTrigger(): boolean {
    return !!this.elementRef.nativeElement.closest('.cdk-overlay-pane');
  }

  /**
   * Open the linked dropdown panel (no-op if already open).
   *
   * @param focusFirst When `false`, skip moving focus into the panel (hover-open).
   *
   * @example
   * trigger.openDropdown();
   */
  openDropdown(focusFirst = true): void {
    const dropdownPanel = this.dropdownPanel();
    if (!dropdownPanel || this.isDropdownOpen) return;

    // Drop sibling / unrelated menus; keep ancestor cascade intact
    this.menuStack.closeNonAncestors(this.elementRef.nativeElement);

    const nested = this.isNestedTrigger();
    const positions: ConnectedPosition[] = this.getPositions();

    this.isDropdownOpen = true;
    this.overlayRef = this.overlay.create({
      direction: this.writingDirection(),
      // Only the root menu needs a backdrop; nested menus share the root dismiss target
      hasBackdrop: !nested,
      backdropClass: 'bg-transparent',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions(positions)
        .withPush(false),
    });

    const templatePortal = new TemplatePortal(
      dropdownPanel.templateRef(),
      this.viewContainerRef
    );
    this.overlayRef.attach(templatePortal);
    this.menuStack.push(this);

    if (focusFirst && dropdownPanel instanceof DropdownMenuComponent) {
      dropdownPanel.focusFirstItem();
    }

    // Escape (and panel-driven close) unwinds from this level downward
    this.closingSubscription = outputToObservable(dropdownPanel.closed).subscribe(() => {
      this.menuStack.closeFrom(this, true);
    });

    // Root backdrop dismisses the entire cascade
    if (!nested) {
      this.closingSubscription.add(
        this.overlayRef.backdropClick().subscribe(() => this.menuStack.closeAll(true))
      );
    }
  }

  /** @inheritdoc */
  containsElement(el: Element): boolean {
    return !!this.overlayRef?.overlayElement?.contains(el);
  }

  /**
   * Detach this overlay only. Used by {@link DropdownMenuStack}.
   *
   * @example
   * entry.closeOverlay(true);
   */
  closeOverlay(restoreFocus = false): void {
    this.destroyDropdown(restoreFocus);
  }

  private getPositions(): ConnectedPosition[] {
    return dropdownConnectedPositions(this.placement(), this.writingDirection());
  }

  private destroyDropdown(restoreFocus = false): void {
    if (!this.overlayRef || !this.isDropdownOpen) {
      return;
    }

    this.closingSubscription.unsubscribe();
    this.closingSubscription = Subscription.EMPTY;
    this.isDropdownOpen = false;
    this.menuStack.pop(this);
    this.overlayRef.detach();

    if (restoreFocus) {
      this.elementRef.nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    this.menuStack.pop(this);
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
    this.closingSubscription.unsubscribe();
    this.isDropdownOpen = false;
  }
}
