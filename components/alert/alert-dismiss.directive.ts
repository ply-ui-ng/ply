import { Directive, HostListener, inject } from '@angular/core';
import { AlertComponent } from './alert.component';

/**
 * A directive that dismisses the parent `ply-alert` when clicked.
 * 
 * @example
 * <button plyAlertDismiss>Close</button>
 */
@Directive({
  selector: '[plyAlertDismiss]',
})
export class AlertDismissDirective {
  private alert = inject(AlertComponent, { optional: true });

  @HostListener('click')
  onClick() {
    if (this.alert) {
      this.alert.handleClose();
    }
  }
}
