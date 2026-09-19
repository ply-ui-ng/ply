import { OutputEmitterRef, TemplateRef, Signal } from '@angular/core';

/**
 * Interface that a dropdown component must satisfy for use with the `[ply-dropdown-menu-trigger]` directive.
 *
 * @example
 * class MyDropdownComponent implements DropdownPanel<MyContext> {
 *   templateRef = inject(TemplateRef<MyContext>);
 *   closed = output<void>();
 * }
 */
export interface DropdownPanel<T> {
  templateRef: Signal<TemplateRef<T>>;
  readonly closed: OutputEmitterRef<void>;
}
