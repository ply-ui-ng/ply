import { Directive, HostListener, output } from '@angular/core';
import { injectElementDirection } from '../direction/inject-direction';

/**
 * A structural directive that wraps elements inside a slider/carousel, adding touch-swipe support.
 *
 * @example
 * <div plySlider (slideAction)="onSlide($event)">
 *   <div>Slide content</div>
 * </div>
 */
@Directive({
  selector: '[plySlider]',
})
export class SliderDirective {
  private readonly writingDirection = injectElementDirection();
  private threshold = 50;
  private startX: number | null = null;
  
  /**
     * The slideAction output property.
     * @example slideAction="value"
     */
    readonly slideAction = output<boolean>();

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.startX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (this.startX === null) return;
    
    const endX = event.changedTouches[0].clientX;
    const deltaX = endX - this.startX;
    this.startX = null;

    const rtl = this.writingDirection() === 'rtl';
    const previous = rtl ? deltaX < -this.threshold : deltaX > this.threshold;
    const next = rtl ? deltaX > this.threshold : deltaX < -this.threshold;
    if (previous) this.slideAction.emit(true);
    else if (next) this.slideAction.emit(false);
  }
}
