import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '../icon/icon.component';
import { cn, FOCUS_RING } from '../tw-merge/tw-merge';
import { injectElementDirection } from '../direction/inject-direction';
import { overlayPositions } from '../overlay-position/overlay-position';

/**
 * Dropdown item in `ply-navigation-menu`. Project panel links as content.
 *
 * @example
 * <ply-navigation-menu-item label="Product">
 *   <a routerLink="/pro" class="block rounded-md px-3 py-2">Pro</a>
 * </ply-navigation-menu-item>
 */
@Component({
  selector: 'ply-navigation-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './navigation-menu-item.component.html',
  host: { '[class]': 'hostCls()' },
})
export class NavigationMenuItemComponent implements OnDestroy {
  private readonly writingDirection = injectElementDirection();
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly extraClass = input('', { alias: 'class' });
  readonly label = input.required<string>();

  readonly open = signal(false);
  private overlayRef: OverlayRef | null = null;
  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');

  protected readonly hostCls = computed(() => cn('relative', this.extraClass()));
  protected readonly triggerCls = computed(() =>
    cn(
      'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
      FOCUS_RING,
    ),
  );

  ngOnDestroy(): void {
    this.close();
  }

  toggle(): void {
    if (this.open()) this.close();
    else this.attach();
  }

  close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.open.set(false);
  }

  private attach(): void {
    if (this.overlayRef) return;
    this.overlayRef = this.overlay.create({
      direction: this.writingDirection(),
      hasBackdrop: true,
      backdropClass: 'bg-transparent',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.trigger())
        .withFlexibleDimensions(false)
        .withPush(true)
        .withPositions(overlayPositions('bottom-start', 8, this.writingDirection())),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape') this.close();
    });
    this.open.set(true);
  }
}
