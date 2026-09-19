import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

/**
 * A behavior directive that emits an event whenever the user clicks outside the host element's bounds.
 * Useful for closing dropdowns, drawers, or modals.
 * 
 * @example
 * <div (plyClickOutside)="closeMenu()">Menu Content</div>
 */
@Directive({
  selector: '[plyClickOutside]',
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);

  /** Event emitted when a click occurs outside the host element. */
  readonly plyClickOutside = output<MouseEvent>();

  @HostListener('document:click', ['$event', '$event.target'])
  public onDocumentClick(event: MouseEvent, targetElement: EventTarget | null): void {
    if (!targetElement) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(targetElement as Node);
    if (!clickedInside) {
      this.plyClickOutside.emit(event);
    }
  }
}
