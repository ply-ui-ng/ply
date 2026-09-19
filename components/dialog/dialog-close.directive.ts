import { Directive, inject, input } from '@angular/core';
import { DialogContext } from './dialog-context';
import { BASE_UI_I18N } from '../i18n/i18n';

/**
 * A directive that automatically closes the current open dialog when the host element is clicked.
 * Injects `DialogContext` to find the active dialog reference.
 * 
 * @example
 * <button ply-button ply-dialog-close>Cancel</button>
 */
@Directive({
  selector: '[ply-dialog-close]',
  host: {
    '(click)': '_onButtonClick($event)',
    '[attr.aria-label]': 'closeAriaLabel()',
    '[attr.type]': 'type()',
  },
})
export class DialogCloseDirective {
  /** Optional aria-label for accessibility. Falls back to `provideBaseUiI18n().close`. */
  readonly ariaLabel = input<string>();
  
  /** The native button type. Defaults to 'button'. */
  readonly type = input('button');

  private dialog = inject(DialogContext, { optional: true });
  private readonly i18n = inject(BASE_UI_I18N);

  protected closeAriaLabel(): string {
    return this.ariaLabel() || this.i18n.close;
  }

  _onButtonClick(_event: MouseEvent) {
    if (this.dialog) {
      this.dialog.close();
    }
  }
}
