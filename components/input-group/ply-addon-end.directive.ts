import { Directive } from '@angular/core';

/**
 * An element positioned at the end of an input group.
 * 
 * @example
 * <span ply-addon-end>.com</span>
 */
@Directive({
  selector: '[ply-addon-end]',
  host: {
    class: 'w-5 h-5 flex items-center justify-center me-4 shrink-0',
  },
})
export class BaseAddonEndDirective {}
