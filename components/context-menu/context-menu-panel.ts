import { OutputEmitterRef, TemplateRef, Signal } from '@angular/core';

/**
 * Interface that a context menu component must satisfy for use with
 * the `[ply-context-menu-trigger]` directive.
 *
 * @example
 * class MyContextMenuComponent implements ContextMenuPanel<MyContext> {
 *   templateRef = inject(TemplateRef<MyContext>);
 *   closed = output<void>();
 * }
 */
export interface ContextMenuPanel<T> {
  templateRef: Signal<TemplateRef<T>>;
  readonly closed: OutputEmitterRef<void>;
}
