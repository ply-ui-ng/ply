import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

/**
 * A behavior directive that smoothly scrolls the window to a target element when the host is clicked.
 * 
 * @example
 * <button [plyScrollTo]="'#footer'">Scroll to Footer</button>
 */
@Directive({
  selector: '[plyScrollTo]',
})
export class ScrollToDirective {
  /** A valid CSS selector (like an ID '#my-div') specifying the target to scroll to. */
  readonly target = input('', { alias: "plyScrollTo" });
  
  private el = inject(ElementRef);

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    const target = this.target();
    if (!target) return;
    
    const targetElement = document.querySelector(target);
    if (targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
