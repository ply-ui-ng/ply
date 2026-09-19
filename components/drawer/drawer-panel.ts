import { OutputEmitterRef, TemplateRef, Signal } from '@angular/core';

/**
 * Interface that a drawer component must satisfy for use with the `[ply-drawer-trigger]` directive.
 *
 * @example
 * class MyDrawerComponent implements DrawerPanel<MyContext> {
 *   templateRef = inject(TemplateRef<MyContext>);
 *   closed = output<void>();
 * }
 */
export interface DrawerPanel<T> {
  templateRef: Signal<TemplateRef<T>>;
  readonly closed: OutputEmitterRef<void>;
}
