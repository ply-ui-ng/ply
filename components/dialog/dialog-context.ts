import { ComponentRef, ApplicationRef, Injectable } from '@angular/core';
import { DialogContainer } from './dialog-container';

/**
 * Injected into every dynamically-opened dialog component to provide `data` and close/reject controls.
 *
 * `TData` is the shape of the data passed into {@link DialogService.open}; `TResult` is the shape
 * resolved back to the caller's subscription when the dialog closes.
 *
 * @example
 * class MyModalComponent {
 *   context = inject<DialogContext<{ userId: string }, { confirmed: boolean }>>(DialogContext);
 *   userId = this.context.data?.userId;
 *   confirm() { this.context.close({ confirmed: true }); }
 * }
 */
@Injectable()
export class DialogContext<TData = unknown, TResult = TData> {
  private componentRef?: ComponentRef<DialogContainer>;
  private appRef?: ApplicationRef;

  data?: TData;
  public _resolve?: (value: TResult | undefined) => void;
  public _reject?: (reason?: TResult) => void;
  private _promise?: Promise<TResult | undefined>;

  private hide() {
    if (this.appRef && this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
    }
  }

  close(result?: TResult) {
    this.hide();
    if (this._resolve) {
      this._resolve(result);
    }
  }

  reject(reason?: TResult) {
    this.hide();
    if (this._reject) {
      this._reject(reason);
    }
  }

  public promise(
    componentRef: ComponentRef<DialogContainer>,
    appRef: ApplicationRef
  ): Promise<TResult | undefined> {
    if (!this._promise) {
      this._promise = new Promise<TResult | undefined>((resolve, reject) => {
        this.componentRef = componentRef;
        this.appRef = appRef;
        this._resolve = resolve;
        this._reject = reject;
      });
    }
    return this._promise;
  }
}
