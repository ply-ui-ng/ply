import {
  Directive,
  ElementRef,
  OnDestroy,
  ViewContainerRef,
  inject,
  input
} from '@angular/core';
import { injectElementDirection } from '../direction/inject-direction';
import { DrawerPanel } from './drawer-panel';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter, merge, Subscription } from 'rxjs';
import { outputToObservable } from '@angular/core/rxjs-interop';

/**
 * A directive that attaches a `ply-drawer` to a trigger element (like a button).
 * Automatically handles the overlay backdrop and click-to-open behavior.
 * 
 * @example
 * <ply-drawer #myDrawer position="right">Drawer Content</ply-drawer>
 * <button [ply-drawer]="myDrawer">Open Drawer</button>
 */
@Directive({
  selector: '[ply-drawer]',
  host: {
    '(click)': 'toggleDrawer()',
    '(keydown.escape)': 'destroyDrawer()',
    '[attr.aria-expanded]': 'isDrawerOpen',
    '[attr.aria-haspopup]': "'dialog'",
  },
})
export class DrawerDirective<T> implements OnDestroy {
  private readonly writingDirection = injectElementDirection();
  isDrawerOpen = false;
  private overlayRef?: OverlayRef;
  private closingSubscription = Subscription.EMPTY;

  /** The edge of the screen to slide the drawer in from. */
  readonly placement = input('end');
  
  /** The reference to the `ply-drawer` component to open. */
  readonly drawerPanel = input.required<DrawerPanel<T>>({ alias: "ply-drawer" });

  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private elementRef = inject(ElementRef);

  toggleDrawer(): void {
    this.isDrawerOpen ? this.destroyDrawer() : this.openDrawer();
  }

  openDrawer(): void {
    const drawerPanel = this.drawerPanel();
    if (!drawerPanel) return;

    this.isDrawerOpen = true;
    this.overlayRef = this.overlay.create({
      direction: this.writingDirection(),
      hasBackdrop: true,
      backdropClass: ['bg-slate-300/50', 'dark:bg-slate-800/80', 'backdrop-blur-[8px]'],
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const templatePortal = new TemplatePortal(
      drawerPanel.templateRef(),
      this.viewContainerRef
    );
    this.overlayRef.attach(templatePortal);

    this.closingSubscription = merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.detachments(),
      outputToObservable(drawerPanel.closed),
      this.overlayRef.keydownEvents().pipe(filter((event) => event.key === 'Escape'))
    ).subscribe(() => this.destroyDrawer());
  }

  destroyDrawer(): void {
    if (!this.overlayRef || !this.isDrawerOpen) {
      return;
    }

    this.closingSubscription.unsubscribe();
    this.isDrawerOpen = false;
    this.overlayRef.detach();
    // Return focus to the trigger, matching the other overlay components.
    this.elementRef.nativeElement.focus?.();
  }

  ngOnDestroy(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
    this.closingSubscription.unsubscribe();
  }
}
