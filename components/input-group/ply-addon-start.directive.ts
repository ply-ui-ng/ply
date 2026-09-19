import { Directive } from '@angular/core';

/**
 * An element positioned at the start of an input group.
 * 
 * @example
 * <span ply-addon-start>https://</span>
 */
@Directive({
  selector: '[ply-addon-start]',
  host: {
    class: 'w-5 h-5 flex items-center justify-center ml-4 shrink-0',
  },
})
export class BaseAddonStartDirective {}
