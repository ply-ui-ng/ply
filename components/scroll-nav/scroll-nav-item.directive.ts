import {
  Directive,
  ElementRef,
  inject,
  input,
  signal,
  output
} from '@angular/core';

/**
 * A directive to link a navigation item to a specific element ID in a `ply-scroll-nav` layout.
 * Automatically receives an active class when its target element is scrolled into view.
 * 
 * @example
 * <a [ply-scroll-nav-item]="'section-1'">Go to Section 1</a>
 */
@Directive({
  selector: '[ply-scroll-nav-item]',
  host: {
    '(click)': 'onClick()',
    '[class.scroll-nav-item]': 'true',
    '[class.!text-blue-600]': 'isActive()',
    '[class.dark:!text-blue-400]': 'isActive()',
    '[attr.aria-current]': 'isActive() ? "location" : null',
  },
})
export class ScrollNavItemDirective {
  elementRef = inject(ElementRef);

  public readonly elementId = input('', { alias: "ply-scroll-nav-item" });
  
  public isActive = signal(false);

  /**
   * The clicked output property.
   * @example clicked="value"
   */
  public clicked = output<ScrollNavItemDirective>();

  public onClick() {
    this.clicked.emit(this);
  }
}
