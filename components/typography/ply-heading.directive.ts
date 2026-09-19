import { Directive } from '@angular/core';

/**
 * Applies standardized heading typography styles to the host element.
 *
 * @example
 * <h1 plyHeadingText>Page Title</h1>
 */
@Directive({
  selector: '[plyHeadingText]',
  host: {
    class: 'text-slate-900 dark:text-white font-semibold'
  }
})
export class BaseHeadingDirective {}
