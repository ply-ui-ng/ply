import { AfterViewInit, Component, ElementRef, inject, Renderer2, ChangeDetectionStrategy } from '@angular/core';
import { DialogContext } from '../dialog-context';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import { DialogFooterComponent } from '../dialog-footer/dialog-footer.component';
import { DialogCloseDirective } from '../dialog-close.directive';
import { IconComponent } from '../../icon/icon.component';
import { IconButtonDirective } from '../../button/ply-icon-button.directive';
import { BaseButtonDirective } from '../../button/ply-button.directive';
import { StrokedButtonDirective } from '../../button/ply-stroked-button.directive';
import { BASE_UI_I18N } from '../../i18n/i18n';
import { AlertDialogData } from './alert-dialog.types';

let alertDialogId = 0;

/**
 * Built-in confirm / alert dialog opened by {@link DialogService.confirm}.
 * Lands with `npx ply-ui-cli add dialog`. Prefer `confirm()` over copying this
 * file into every feature.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ply-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  imports: [
    DialogComponent,
    DialogHeaderComponent,
    DialogBodyComponent,
    DialogFooterComponent,
    DialogCloseDirective,
    IconComponent,
    IconButtonDirective,
    BaseButtonDirective,
    StrokedButtonDirective,
  ],
})
export class AlertDialogComponent implements AfterViewInit {
  private readonly context = inject<DialogContext<AlertDialogData, boolean>>(DialogContext);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly i18n = inject(BASE_UI_I18N);
  private readonly uid = alertDialogId++;

  readonly titleId = `ply-alert-dialog-title-${this.uid}`;
  readonly messageId = `ply-alert-dialog-message-${this.uid}`;
  readonly data = this.context.data as AlertDialogData;

  protected confirmLabel(): string {
    return this.data.confirmLabel || this.i18n.confirm;
  }

  protected cancelLabel(): string {
    return this.data.cancelLabel || this.i18n.cancel;
  }

  ngAfterViewInit(): void {
    const dialogEl = this.elementRef.nativeElement.closest('[role="dialog"]');
    if (dialogEl) {
      this.renderer.setAttribute(dialogEl, 'role', 'alertdialog');
      this.renderer.setAttribute(dialogEl, 'aria-labelledby', this.titleId);
      if (this.data.description) {
        this.renderer.setAttribute(dialogEl, 'aria-describedby', this.messageId);
      }
    }
  }

  confirm(): void {
    this.context.close(true);
  }
}
