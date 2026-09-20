import { Directive, ElementRef, inject } from '@angular/core';
import { CollapsibleComponent } from './collapsible.component';

/**
 * Toggles the parent `ply-collapsible`. Put it on a native `button`.
 *
 * @example
 * <button type="button" ply-collapsible-trigger>Details</button>
 */
@Directive({
  selector: '[ply-collapsible-trigger]',
  host: {
    '(click)': 'collapsible.toggle()',
    '[attr.aria-expanded]': 'collapsible.open()',
    '[attr.aria-controls]': 'collapsible.contentId',
  },
})
export class CollapsibleTriggerDirective {
  readonly collapsible = inject(CollapsibleComponent);
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    const node = this.el.nativeElement;
    if (node.tagName === 'BUTTON' && !node.getAttribute('type')) {
      node.setAttribute('type', 'button');
    }
  }
}
