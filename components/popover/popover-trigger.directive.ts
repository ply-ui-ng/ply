import { Directive, ElementRef, HostListener, OnDestroy, inject, input } from '@angular/core';
import { PopoverComponent } from './popover.component';
import { PopoverPlacement } from '../types';

/**
 * Alternative external trigger for `ply-popover`.
 * Use this when the trigger button must live outside the `<ply-popover>` element.
 *
 * @example
 * <ply-popover #myPop placement="bottom-start">Panel content</ply-popover>
 * <button [ply-popover-trigger]="myPop" placement="bottom-end">Open</button>
 */
@Directive({
  selector: '[ply-popover-trigger]',
})
export class PopoverTriggerDirective implements OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly popover = input.required<PopoverComponent>({ alias: "ply-popover-trigger" });
  readonly placement = input<PopoverPlacement>('bottom-start');

  @HostListener('click')
  onClick() {
    const popover = this.popover();
    if (!popover) return;
    popover.toggleWithPlacement(this.placement(), this.el.nativeElement);
  }

  ngOnDestroy() { this.popover()?.close(); }
}
