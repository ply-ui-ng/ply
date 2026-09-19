import { ViewContainerRef, Signal } from '@angular/core';
import { DialogContext } from './dialog-context';

/**
 * Interface that a dialog container must satisfy.
 * The default implementation is `DialogContainerComponent`.
 */
export interface DialogContainer {
  /** The dialog context injected into the hosted component. */
  context: DialogContext<unknown, unknown>;
  /** The ViewContainerRef where the dialog content is dynamically rendered. */
  container: Signal<ViewContainerRef>;
  /** Optional CSS class string applied to the container wrapper. */
  className: string;
  /**
   * Recompute aria-labelledby / aria-label after dialog content is inserted.
   * `ngAfterViewInit` runs before {@link DialogService} creates the body.
   */
  applyDialogLabelling?(): void;
}
